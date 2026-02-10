(function ($) {
    'use strict';

    $(document).ready(function () {
        // ─── Color picker hex preview ─────────────
        $('input[type="color"]').on('input', function () {
            $(this).next('.rayochat-color-hex').text(this.value.toUpperCase());
        });

        // ─── Test Connection ──────────────────────
        $('#rayochat-test-connection').on('click', function () {
            var $btn = $(this);
            var $result = $('#rayochat-test-result');

            $btn.prop('disabled', true).text('Connessione in corso...');
            $result.text('').removeClass('success error');

            $.ajax({
                url: rayochatAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rayochat_test_connection',
                    nonce: rayochatAdmin.nonce,
                    webhook_url: $('#rayochat_webhook_url').val(),
                    username: $('#rayochat_auth_username').val(),
                    password: $('#rayochat_auth_password').val()
                },
                success: function (response) {
                    if (response.success) {
                        $result.addClass('success').text(response.data.message);
                    } else {
                        $result.addClass('error').text(response.data.message);
                    }
                },
                error: function () {
                    $result.addClass('error').text('Errore di rete. Riprova.');
                },
                complete: function () {
                    $btn.prop('disabled', false).html(
                        '<span class="dashicons dashicons-yes-alt"></span> Testa Connessione'
                    );
                }
            });
        });

        // ─── Update System Prompt ─────────────────
        $('#rayochat-update-prompt').on('click', function () {
            var $btn = $(this);
            var $result = $('#rayochat-prompt-result');
            var prompt = $('#rayochat_system_prompt').val();

            if (!prompt.trim()) {
                $result.addClass('error').text('Il system prompt non può essere vuoto.');
                return;
            }

            $btn.prop('disabled', true).text('Invio in corso...');
            $result.text('').removeClass('success error');

            $.ajax({
                url: rayochatAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rayochat_update_system_prompt',
                    nonce: rayochatAdmin.nonce,
                    system_prompt: prompt
                },
                success: function (response) {
                    if (response.success) {
                        $result.addClass('success').text(response.data.message);
                    } else {
                        $result.addClass('error').text(response.data.message);
                    }
                },
                error: function () {
                    $result.addClass('error').text('Errore di rete. Riprova.');
                },
                complete: function () {
                    $btn.prop('disabled', false).html(
                        '<span class="dashicons dashicons-cloud-upload"></span> Aggiorna System Prompt sul Backend'
                    );
                }
            });
        });

        // ─── Fetch System Prompt ──────────────────
        $('#rayochat-fetch-prompt').on('click', function () {
            var $btn = $(this);
            var $result = $('#rayochat-prompt-result');

            $btn.prop('disabled', true).text('Caricamento...');
            $result.text('').removeClass('success error');

            $.ajax({
                url: rayochatAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rayochat_fetch_system_prompt',
                    nonce: rayochatAdmin.nonce
                },
                success: function (response) {
                    if (response.success) {
                        $('#rayochat_system_prompt').val(response.data.systemPrompt || '');
                        var msg = response.data.message;
                        if (response.data.updatedAt) {
                            msg += ' (aggiornato: ' + response.data.updatedAt + ')';
                        }
                        if (response.data.isDefault) {
                            msg += ' [DEFAULT]';
                        }
                        $result.addClass('success').text(msg);
                    } else {
                        $result.addClass('error').text(response.data.message);
                    }
                },
                error: function () {
                    $result.addClass('error').text('Errore di rete. Riprova.');
                },
                complete: function () {
                    $btn.prop('disabled', false).html(
                        '<span class="dashicons dashicons-cloud-saved"></span> Carica dal Backend'
                    );
                }
            });
        });

        // ─── WP Media Upload for Custom Icon ──────
        var mediaFrame;

        $('#rayochat-upload-icon').on('click', function (e) {
            e.preventDefault();

            if (mediaFrame) {
                mediaFrame.open();
                return;
            }

            mediaFrame = wp.media({
                title: 'Seleziona Icona Chatbot',
                button: { text: 'Usa questa icona' },
                multiple: false,
                library: { type: 'image' }
            });

            mediaFrame.on('select', function () {
                var attachment = mediaFrame.state().get('selection').first().toJSON();
                $('#rayochat_fab_icon').val(attachment.id);
                $('#rayochat-icon-preview').html(
                    '<img src="' + attachment.url + '" style="max-width:60px;max-height:60px;border-radius:50%;border:2px solid #ddd;" />'
                );
                $('#rayochat-remove-icon').show();
            });

            mediaFrame.open();
        });

        $('#rayochat-remove-icon').on('click', function (e) {
            e.preventDefault();
            $('#rayochat_fab_icon').val('0');
            $('#rayochat-icon-preview').html(
                '<span class="description">Nessuna icona custom — verrà usata l\'icona di default.</span>'
            );
            $(this).hide();
        });
    });
})(jQuery);
