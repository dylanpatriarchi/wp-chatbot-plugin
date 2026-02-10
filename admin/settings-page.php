<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap rayochat-settings-wrap">
    <div class="rayochat-settings-header">
        <h1>
            <span class="dashicons dashicons-format-chat"></span>
            <?php esc_html_e('RayoChat', 'rayochat'); ?>
        </h1>
        <p class="description">
            <?php esc_html_e('Configura il chatbot AI e la connessione al backend n8n.', 'rayochat'); ?>
        </p>
    </div>

    <form method="post" action="options.php" id="rayochat-settings-form">
        <?php settings_fields('rayochat_settings'); ?>

        <!-- Connection Settings -->
        <div class="rayochat-card">
            <h2 class="rayochat-card-title">
                <span class="dashicons dashicons-admin-links"></span>
                <?php esc_html_e('Connessione Backend', 'rayochat'); ?>
            </h2>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="rayochat_webhook_url">
                            <?php esc_html_e('Webhook URL', 'rayochat'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="url" id="rayochat_webhook_url" name="rayochat_webhook_url"
                            value="<?php echo esc_attr(get_option('rayochat_webhook_url', '')); ?>" class="regular-text"
                            placeholder="https://n8n.example.com/webhook/pixinest" />
                        <p class="description">
                            <?php esc_html_e('URL completo del webhook n8n per la chat (POST).', 'rayochat'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="rayochat_auth_username">
                            <?php esc_html_e('Username', 'rayochat'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="rayochat_auth_username" name="rayochat_auth_username"
                            value="<?php echo esc_attr(get_option('rayochat_auth_username', '')); ?>"
                            class="regular-text" autocomplete="off" />
                        <p class="description">
                            <?php esc_html_e('Username per l\'autenticazione Basic Auth.', 'rayochat'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="rayochat_auth_password">
                            <?php esc_html_e('Password', 'rayochat'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="password" id="rayochat_auth_password" name="rayochat_auth_password"
                            value="<?php echo esc_attr(get_option('rayochat_auth_password', '')); ?>"
                            class="regular-text" autocomplete="new-password" />
                        <p class="description">
                            <?php esc_html_e('Password per l\'autenticazione Basic Auth.', 'rayochat'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <button type="button" id="rayochat-test-connection" class="button button-secondary">
                            <span class="dashicons dashicons-yes-alt"></span>
                            <?php esc_html_e('Testa Connessione', 'rayochat'); ?>
                        </button>
                        <span id="rayochat-test-result" class="rayochat-status-msg"></span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Appearance Settings -->
        <div class="rayochat-card">
            <h2 class="rayochat-card-title">
                <span class="dashicons dashicons-art"></span>
                <?php esc_html_e('Aspetto', 'rayochat'); ?>
            </h2>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="rayochat_chat_enabled">
                            <?php esc_html_e('Chatbot Attivo', 'rayochat'); ?>
                        </label>
                    </th>
                    <td>
                        <label class="rayochat-toggle">
                            <input type="checkbox" id="rayochat_chat_enabled" name="rayochat_chat_enabled" value="1"
                                <?php checked(get_option('rayochat_chat_enabled', true)); ?> />
                            <span class="rayochat-toggle-slider"></span>
                        </label>
                        <p class="description">
                            <?php esc_html_e('Abilita o disabilita il widget chatbot nel frontend.', 'rayochat'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="rayochat_bot_name">
                            <?php esc_html_e('Nome Bot', 'rayochat'); ?>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="rayochat_bot_name" name="rayochat_bot_name"
                            value="<?php echo esc_attr(get_option('rayochat_bot_name', 'RayoChat')); ?>"
                            class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="rayochat_welcome_message">
                            <?php esc_html_e('Messaggio di Benvenuto', 'rayochat'); ?>
                        </label>
                    </th>
                    <td>
                        <textarea id="rayochat_welcome_message" name="rayochat_welcome_message" rows="2"
                            class="large-text"><?php echo esc_textarea(get_option('rayochat_welcome_message', 'Ciao! Come posso aiutarti? 👋')); ?></textarea>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Colors -->
        <div class="rayochat-card">
            <h2 class="rayochat-card-title">
                <span class="dashicons dashicons-admin-appearance"></span>
                <?php esc_html_e('Colori', 'rayochat'); ?>
            </h2>

            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Colore Primario (Header, FAB)', 'rayochat'); ?></th>
                    <td>
                        <input type="color" name="rayochat_primary_color"
                            value="<?php echo esc_attr(get_option('rayochat_primary_color', '#6C3CE1')); ?>" />
                        <span
                            class="rayochat-color-hex"><?php echo esc_html(get_option('rayochat_primary_color', '#6C3CE1')); ?></span>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Colore Secondario (Gradiente)', 'rayochat'); ?></th>
                    <td>
                        <input type="color" name="rayochat_secondary_color"
                            value="<?php echo esc_attr(get_option('rayochat_secondary_color', '#5A2DC5')); ?>" />
                        <span
                            class="rayochat-color-hex"><?php echo esc_html(get_option('rayochat_secondary_color', '#5A2DC5')); ?></span>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Bubble Utente — Sfondo', 'rayochat'); ?></th>
                    <td>
                        <input type="color" name="rayochat_user_bubble_color"
                            value="<?php echo esc_attr(get_option('rayochat_user_bubble_color', '#6C3CE1')); ?>" />
                        <span
                            class="rayochat-color-hex"><?php echo esc_html(get_option('rayochat_user_bubble_color', '#6C3CE1')); ?></span>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Bubble Utente — Testo', 'rayochat'); ?></th>
                    <td>
                        <input type="color" name="rayochat_user_text_color"
                            value="<?php echo esc_attr(get_option('rayochat_user_text_color', '#FFFFFF')); ?>" />
                        <span
                            class="rayochat-color-hex"><?php echo esc_html(get_option('rayochat_user_text_color', '#FFFFFF')); ?></span>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Bubble Bot — Sfondo', 'rayochat'); ?></th>
                    <td>
                        <input type="color" name="rayochat_bot_bubble_color"
                            value="<?php echo esc_attr(get_option('rayochat_bot_bubble_color', '#F0F0F0')); ?>" />
                        <span
                            class="rayochat-color-hex"><?php echo esc_html(get_option('rayochat_bot_bubble_color', '#F0F0F0')); ?></span>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Bubble Bot — Testo', 'rayochat'); ?></th>
                    <td>
                        <input type="color" name="rayochat_bot_text_color"
                            value="<?php echo esc_attr(get_option('rayochat_bot_text_color', '#1A1A1A')); ?>" />
                        <span
                            class="rayochat-color-hex"><?php echo esc_html(get_option('rayochat_bot_text_color', '#1A1A1A')); ?></span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Custom Icon -->
        <div class="rayochat-card">
            <h2 class="rayochat-card-title">
                <span class="dashicons dashicons-format-image"></span>
                <?php esc_html_e('Icona Custom', 'rayochat'); ?>
            </h2>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Icona FAB', 'rayochat'); ?></th>
                    <td>
                        <?php $fab_icon_id = (int) get_option('rayochat_fab_icon', 0); ?>
                        <input type="hidden" id="rayochat_fab_icon" name="rayochat_fab_icon"
                            value="<?php echo esc_attr($fab_icon_id); ?>" />
                        <div id="rayochat-icon-preview" style="margin-bottom:10px;">
                            <?php if ($fab_icon_id): ?>
                                <img src="<?php echo esc_url(wp_get_attachment_url($fab_icon_id)); ?>"
                                    style="max-width:60px;max-height:60px;border-radius:50%;border:2px solid #ddd;" />
                            <?php else: ?>
                                <span
                                    class="description"><?php esc_html_e('Nessuna icona custom — verrà usata l\'icona di default.', 'rayochat'); ?></span>
                            <?php endif; ?>
                        </div>
                        <button type="button" id="rayochat-upload-icon" class="button button-secondary">
                            <span class="dashicons dashicons-upload"></span>
                            <?php esc_html_e('Carica Icona', 'rayochat'); ?>
                        </button>
                        <button type="button" id="rayochat-remove-icon" class="button button-link-delete" <?php echo $fab_icon_id ? '' : 'style="display:none;"'; ?>>
                            <?php esc_html_e('Rimuovi', 'rayochat'); ?>
                        </button>
                        <p class="description">
                            <?php esc_html_e('Immagine quadrata consigliata (60x60px o superiore). Se vuota, viene usata l\'icona chat di default.', 'rayochat'); ?>
                        </p>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="rayochat-card">
            <h2 class="rayochat-card-title">
                <span class="dashicons dashicons-admin-generic"></span>
                <?php esc_html_e('Footer', 'rayochat'); ?>
            </h2>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Nascondi "Powered by Rayo Consulting"', 'rayochat'); ?></th>
                    <td>
                        <label class="rayochat-toggle">
                            <input type="checkbox" id="rayochat_hide_powered_by" name="rayochat_hide_powered_by"
                                value="1" <?php checked(get_option('rayochat_hide_powered_by', false)); ?> />
                            <span class="rayochat-toggle-slider"></span>
                        </label>
                        <p class="description">
                            <?php esc_html_e('Se attivo, il footer "Powered by Rayo Consulting" non verrà mostrato nel widget.', 'rayochat'); ?>
                        </p>
                    </td>
                </tr>
            </table>
        </div>

        <!-- System Prompt -->
        <div class="rayochat-card">
            <h2 class="rayochat-card-title">
                <span class="dashicons dashicons-editor-code"></span>
                <?php esc_html_e('System Prompt', 'rayochat'); ?>
            </h2>

            <table class="form-table">
                <tr>
                    <td colspan="2">
                        <textarea id="rayochat_system_prompt" name="rayochat_system_prompt" rows="8"
                            class="large-text code"
                            placeholder="You are a helpful and friendly AI assistant..."><?php echo esc_textarea(get_option('rayochat_system_prompt', '')); ?></textarea>
                        <p class="description">
                            <?php esc_html_e('Il prompt di sistema definisce il comportamento dell\'AI. Verrà inviato al backend quando clicchi "Aggiorna System Prompt".', 'rayochat'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <button type="button" id="rayochat-fetch-prompt" class="button button-secondary">
                            <span class="dashicons dashicons-cloud-saved"></span>
                            <?php esc_html_e('Carica dal Backend', 'rayochat'); ?>
                        </button>
                        <button type="button" id="rayochat-update-prompt" class="button button-primary">
                            <span class="dashicons dashicons-cloud-upload"></span>
                            <?php esc_html_e('Aggiorna System Prompt sul Backend', 'rayochat'); ?>
                        </button>
                        <span id="rayochat-prompt-result" class="rayochat-status-msg"></span>
                    </td>
                </tr>
            </table>
        </div>

        <?php submit_button(__('Salva Impostazioni', 'rayochat'), 'primary large', 'submit', true); ?>
    </form>
</div>