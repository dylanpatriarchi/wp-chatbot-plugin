<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap pixinest-settings-wrap">
    <div class="pixinest-settings-header">
        <h1>
            <span class="dashicons dashicons-format-chat"></span>
            <?php esc_html_e('PixiNest Chatbot', 'pixinest-chatbot'); ?>
        </h1>
        <p class="description">
            <?php esc_html_e('Configura il chatbot AI e la connessione al backend n8n.', 'pixinest-chatbot'); ?>
        </p>
    </div>

    <form method="post" action="options.php" id="pixinest-settings-form">
        <?php settings_fields('pixinest_chatbot_settings'); ?>

        <!-- Connection Settings -->
        <div class="pixinest-card">
            <h2 class="pixinest-card-title">
                <span class="dashicons dashicons-admin-links"></span>
                <?php esc_html_e('Connessione Backend', 'pixinest-chatbot'); ?>
            </h2>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="pixinest_webhook_url">
                            <?php esc_html_e('Webhook URL', 'pixinest-chatbot'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="url" id="pixinest_webhook_url" name="pixinest_webhook_url"
                            value="<?php echo esc_attr(get_option('pixinest_webhook_url', '')); ?>" class="regular-text"
                            placeholder="https://n8n.example.com/webhook/pixinest" />
                        <p class="description">
                            <?php esc_html_e('URL completo del webhook n8n per la chat (POST).', 'pixinest-chatbot'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="pixinest_auth_username">
                            <?php esc_html_e('Username', 'pixinest-chatbot'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="pixinest_auth_username" name="pixinest_auth_username"
                            value="<?php echo esc_attr(get_option('pixinest_auth_username', '')); ?>"
                            class="regular-text" autocomplete="off" />
                        <p class="description">
                            <?php esc_html_e('Username per l\'autenticazione Basic Auth.', 'pixinest-chatbot'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="pixinest_auth_password">
                            <?php esc_html_e('Password', 'pixinest-chatbot'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="password" id="pixinest_auth_password" name="pixinest_auth_password"
                            value="<?php echo esc_attr(get_option('pixinest_auth_password', '')); ?>"
                            class="regular-text" autocomplete="new-password" />
                        <p class="description">
                            <?php esc_html_e('Password per l\'autenticazione Basic Auth.', 'pixinest-chatbot'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <button type="button" id="pixinest-test-connection" class="button button-secondary">
                            <span class="dashicons dashicons-yes-alt"></span>
                            <?php esc_html_e('Testa Connessione', 'pixinest-chatbot'); ?>
                        </button>
                        <span id="pixinest-test-result" class="pixinest-status-msg"></span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Appearance Settings -->
        <div class="pixinest-card">
            <h2 class="pixinest-card-title">
                <span class="dashicons dashicons-art"></span>
                <?php esc_html_e('Aspetto', 'pixinest-chatbot'); ?>
            </h2>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="pixinest_chat_enabled">
                            <?php esc_html_e('Chatbot Attivo', 'pixinest-chatbot'); ?>
                        </label>
                    </th>
                    <td>
                        <label class="pixinest-toggle">
                            <input type="checkbox" id="pixinest_chat_enabled" name="pixinest_chat_enabled" value="1"
                                <?php checked(get_option('pixinest_chat_enabled', true)); ?> />
                            <span class="pixinest-toggle-slider"></span>
                        </label>
                        <p class="description">
                            <?php esc_html_e('Abilita o disabilita il widget chatbot nel frontend.', 'pixinest-chatbot'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="pixinest_bot_name">
                            <?php esc_html_e('Nome Bot', 'pixinest-chatbot'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="pixinest_bot_name" name="pixinest_bot_name"
                            value="<?php echo esc_attr(get_option('pixinest_bot_name', 'PixiNest')); ?>"
                            class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="pixinest_welcome_message">
                            <?php esc_html_e('Messaggio di Benvenuto', 'pixinest-chatbot'); ?>
                        </label>
                    </th>
                    <td>
                        <textarea id="pixinest_welcome_message" name="pixinest_welcome_message" rows="2"
                            class="large-text"><?php echo esc_textarea(get_option('pixinest_welcome_message', 'Ciao! Come posso aiutarti? 👋')); ?></textarea>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="pixinest_primary_color">
                            <?php esc_html_e('Colore Primario', 'pixinest-chatbot'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="color" id="pixinest_primary_color" name="pixinest_primary_color"
                            value="<?php echo esc_attr(get_option('pixinest_primary_color', '#6C3CE1')); ?>" />
                        <span class="pixinest-color-preview" id="pixinest-color-hex">
                            <?php echo esc_html(get_option('pixinest_primary_color', '#6C3CE1')); ?>
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- System Prompt -->
        <div class="pixinest-card">
            <h2 class="pixinest-card-title">
                <span class="dashicons dashicons-editor-code"></span>
                <?php esc_html_e('System Prompt', 'pixinest-chatbot'); ?>
            </h2>

            <table class="form-table">
                <tr>
                    <td colspan="2">
                        <textarea id="pixinest_system_prompt" name="pixinest_system_prompt" rows="8"
                            class="large-text code"
                            placeholder="You are PixiNest, a helpful and friendly AI assistant..."><?php echo esc_textarea(get_option('pixinest_system_prompt', '')); ?></textarea>
                        <p class="description">
                            <?php esc_html_e('Il prompt di sistema definisce il comportamento dell\'AI. Verrà inviato al backend quando clicchi "Aggiorna System Prompt".', 'pixinest-chatbot'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <button type="button" id="pixinest-fetch-prompt" class="button button-secondary">
                            <span class="dashicons dashicons-cloud-saved"></span>
                            <?php esc_html_e('Carica dal Backend', 'pixinest-chatbot'); ?>
                        </button>
                        <button type="button" id="pixinest-update-prompt" class="button button-primary">
                            <span class="dashicons dashicons-cloud-upload"></span>
                            <?php esc_html_e('Aggiorna System Prompt sul Backend', 'pixinest-chatbot'); ?>
                        </button>
                        <span id="pixinest-prompt-result" class="pixinest-status-msg"></span>
                    </td>
                </tr>
            </table>
        </div>

        <?php submit_button(__('Salva Impostazioni', 'pixinest-chatbot'), 'primary large', 'submit', true); ?>
    </form>
</div>