<?php
/**
 * Plugin Name: PixiNest Chatbot
 * Plugin URI: https://pixinest.com
 * Description: AI Chatbot widget powered by n8n backend with localStorage persistence and dynamic system prompt management.
 * Version: 1.0.0
 * Author: PixiNest
 * License: GPL v2 or later
 * Text Domain: pixinest-chatbot
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PIXINEST_CHATBOT_VERSION', '1.0.0');
define('PIXINEST_CHATBOT_PATH', plugin_dir_path(__FILE__));
define('PIXINEST_CHATBOT_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class PixiNest_Chatbot
{

    private static $instance = null;

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('wp_ajax_pixinest_update_system_prompt', [$this, 'ajax_update_system_prompt']);
        add_action('wp_ajax_pixinest_fetch_system_prompt', [$this, 'ajax_fetch_system_prompt']);
        add_action('wp_ajax_pixinest_test_connection', [$this, 'ajax_test_connection']);
        add_action('wp_footer', [$this, 'render_chatbot_widget']);
    }

    /**
     * Register admin menu
     */
    public function register_admin_menu()
    {
        add_menu_page(
            __('PixiNest Chatbot', 'pixinest-chatbot'),
            __('PixiNest Chat', 'pixinest-chatbot'),
            'manage_options',
            'pixinest-chatbot',
            [$this, 'render_settings_page'],
            'dashicons-format-chat',
            80
        );
    }

    /**
     * Register plugin settings
     */
    public function register_settings()
    {
        register_setting('pixinest_chatbot_settings', 'pixinest_webhook_url', [
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => '',
        ]);
        register_setting('pixinest_chatbot_settings', 'pixinest_auth_username', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => '',
        ]);
        register_setting('pixinest_chatbot_settings', 'pixinest_auth_password', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => '',
        ]);
        register_setting('pixinest_chatbot_settings', 'pixinest_system_prompt', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_textarea_field',
            'default' => '',
        ]);
        register_setting('pixinest_chatbot_settings', 'pixinest_bot_name', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'PixiNest',
        ]);
        register_setting('pixinest_chatbot_settings', 'pixinest_welcome_message', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_textarea_field',
            'default' => 'Ciao! Come posso aiutarti? 👋',
        ]);
        register_setting('pixinest_chatbot_settings', 'pixinest_primary_color', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default' => '#6C3CE1',
        ]);
        register_setting('pixinest_chatbot_settings', 'pixinest_chat_enabled', [
            'type' => 'boolean',
            'default' => true,
        ]);
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook)
    {
        if ($hook !== 'toplevel_page_pixinest-chatbot') {
            return;
        }
        wp_enqueue_style(
            'pixinest-admin-css',
            PIXINEST_CHATBOT_URL . 'assets/css/admin.css',
            [],
            PIXINEST_CHATBOT_VERSION
        );
        wp_enqueue_script(
            'pixinest-admin-js',
            PIXINEST_CHATBOT_URL . 'assets/js/admin.js',
            ['jquery'],
            PIXINEST_CHATBOT_VERSION,
            true
        );
        wp_localize_script('pixinest-admin-js', 'pixinestAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('pixinest_admin_nonce'),
        ]);
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets()
    {
        if (!get_option('pixinest_chat_enabled', true)) {
            return;
        }

        $webhook_url = get_option('pixinest_webhook_url', '');
        if (empty($webhook_url)) {
            return;
        }

        wp_enqueue_style(
            'pixinest-chatbot-css',
            PIXINEST_CHATBOT_URL . 'assets/css/chatbot.css',
            [],
            PIXINEST_CHATBOT_VERSION
        );
        wp_enqueue_script(
            'pixinest-chatbot-js',
            PIXINEST_CHATBOT_URL . 'assets/js/chatbot.js',
            [],
            PIXINEST_CHATBOT_VERSION,
            true
        );

        $primary_color = get_option('pixinest_primary_color', '#6C3CE1');

        wp_localize_script('pixinest-chatbot-js', 'pixinestConfig', [
            'proxyUrl' => rest_url('pixinest/v1/chat'),
            'nonce' => wp_create_nonce('wp_rest'),
            'botName' => get_option('pixinest_bot_name', 'PixiNest'),
            'welcomeMessage' => get_option('pixinest_welcome_message', 'Ciao! Come posso aiutarti? 👋'),
            'primaryColor' => $primary_color,
        ]);

        // Inject CSS variable for primary color
        wp_add_inline_style('pixinest-chatbot-css', ":root { --pixinest-primary: {$primary_color}; }");
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes()
    {
        register_rest_route('pixinest/v1', '/chat', [
            'methods' => 'POST',
            'callback' => [$this, 'rest_chat_proxy'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * REST API: Proxy chat requests to n8n (avoids CORS, hides credentials)
     */
    public function rest_chat_proxy($request)
    {
        $webhook_url = get_option('pixinest_webhook_url', '');
        $username = get_option('pixinest_auth_username', '');
        $password = get_option('pixinest_auth_password', '');

        if (empty($webhook_url)) {
            return new \WP_Error('not_configured', 'Chatbot non configurato.', ['status' => 503]);
        }

        $body = $request->get_json_params();
        $message = sanitize_textarea_field($body['message'] ?? '');
        $chat_id = sanitize_text_field($body['chatId'] ?? '');

        if (empty($message)) {
            return new \WP_Error('empty_message', 'Messaggio vuoto.', ['status' => 400]);
        }

        $response = wp_remote_post($webhook_url, [
            'timeout' => 60,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($username . ':' . $password),
            ],
            'body' => wp_json_encode([
                'message' => $message,
                'chatId' => $chat_id,
            ]),
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error('backend_error', 'Errore backend: ' . $response->get_error_message(), ['status' => 502]);
        }

        $code = wp_remote_retrieve_response_code($response);
        $resp_body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200) {
            return new \WP_Error('backend_error', 'Errore backend HTTP ' . $code, ['status' => 502]);
        }

        return rest_ensure_response($resp_body);
    }

    /**
     * Render the settings page
     */
    public function render_settings_page()
    {
        require_once PIXINEST_CHATBOT_PATH . 'admin/settings-page.php';
    }

    /**
     * Render chatbot widget in footer
     */
    public function render_chatbot_widget()
    {
        if (!get_option('pixinest_chat_enabled', true)) {
            return;
        }
        if (empty(get_option('pixinest_webhook_url', ''))) {
            return;
        }
        echo '<div id="pixinest-chatbot-root"></div>';
    }

    /**
     * AJAX: Update system prompt on n8n backend
     */
    public function ajax_update_system_prompt()
    {
        check_ajax_referer('pixinest_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $webhook_url = get_option('pixinest_webhook_url', '');
        $username = get_option('pixinest_auth_username', '');
        $password = get_option('pixinest_auth_password', '');
        $prompt = sanitize_textarea_field($_POST['system_prompt'] ?? '');

        if (empty($webhook_url) || empty($prompt)) {
            wp_send_json_error(['message' => 'URL webhook o system prompt mancante.']);
        }

        // Build the system prompt endpoint URL
        $prompt_url = trailingslashit(dirname($webhook_url)) . 'pixinest/system-prompt';

        $response = wp_remote_post($prompt_url, [
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($username . ':' . $password),
            ],
            'body' => wp_json_encode(['systemPrompt' => $prompt]),
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error(['message' => 'Errore connessione: ' . $response->get_error_message()]);
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code === 200 && !empty($body['success'])) {
            // Also save locally
            update_option('pixinest_system_prompt', $prompt);
            wp_send_json_success(['message' => 'System prompt aggiornato con successo!', 'data' => $body]);
        } else {
            wp_send_json_error([
                'message' => 'Errore dal backend: ' . ($body['error'] ?? "HTTP $code"),
                'data' => $body,
            ]);
        }
    }

    /**
     * AJAX: Test connection to n8n webhook
     */
    public function ajax_test_connection()
    {
        check_ajax_referer('pixinest_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $webhook_url = sanitize_url($_POST['webhook_url'] ?? '');
        $username = sanitize_text_field($_POST['username'] ?? '');
        $password = sanitize_text_field($_POST['password'] ?? '');

        if (empty($webhook_url)) {
            wp_send_json_error(['message' => 'URL webhook mancante.']);
        }

        $response = wp_remote_post($webhook_url, [
            'timeout' => 15,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($username . ':' . $password),
            ],
            'body' => wp_json_encode([
                'message' => 'Test connection from WordPress plugin',
                'chatId' => 'wp-test-' . time(),
            ]),
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error(['message' => 'Connessione fallita: ' . $response->get_error_message()]);
        }

        $code = wp_remote_retrieve_response_code($response);

        if ($code === 200) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            wp_send_json_success(['message' => 'Connessione riuscita! ✅', 'response' => $body]);
        } else {
            wp_send_json_error(['message' => "Errore HTTP $code. Verifica URL e credenziali."]);
        }
    }

    /**
     * AJAX: Fetch current system prompt from n8n backend (GET)
     */
    public function ajax_fetch_system_prompt()
    {
        check_ajax_referer('pixinest_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $webhook_url = get_option('pixinest_webhook_url', '');
        $username = get_option('pixinest_auth_username', '');
        $password = get_option('pixinest_auth_password', '');

        if (empty($webhook_url)) {
            wp_send_json_error(['message' => 'URL webhook non configurato.']);
        }

        // Build the GET system prompt endpoint URL
        $prompt_url = trailingslashit(dirname($webhook_url)) . 'pixinest/system-prompt';

        $response = wp_remote_get($prompt_url, [
            'timeout' => 15,
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode($username . ':' . $password),
            ],
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error(['message' => 'Errore connessione: ' . $response->get_error_message()]);
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code === 200 && !empty($body['success'])) {
            // Also update local copy
            if (!empty($body['systemPrompt'])) {
                update_option('pixinest_system_prompt', $body['systemPrompt']);
            }
            wp_send_json_success([
                'message' => 'System prompt caricato dal backend.',
                'systemPrompt' => $body['systemPrompt'] ?? '',
                'isDefault' => $body['isDefault'] ?? false,
                'updatedAt' => $body['updatedAt'] ?? null,
            ]);
        } else {
            wp_send_json_error([
                'message' => 'Errore dal backend: ' . ($body['error'] ?? "HTTP $code"),
            ]);
        }
    }
}

// Initialize plugin
PixiNest_Chatbot::get_instance();
