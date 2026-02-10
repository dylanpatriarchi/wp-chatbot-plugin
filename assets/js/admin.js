(function ($) {
    'use strict';

    $(document).ready(function () {
        // Color picker hex preview
        $('#pixinest_primary_color').on('input', function () {
            $('#pixinest-color-hex').text(this.value.toUpperCase());
        });

        // Test Connection
        $('#pixinest-test-connection').on('click', function () {
            var $btn = $(this);
            var $result = $('#pixinest-test-result');

            $btn.prop('disabled', true).addClass('pixinest-loading');
            $result.removeClass('success error').text('Connessione in corso...');

            $.ajax({
                url: pixinestAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pixinest_test_connection',
                    nonce: pixinestAdmin.nonce,
                    webhook_url: $('#pixinest_webhook_url').val(),
                    username: $('#pixinest_auth_username').val(),
                    password: $('#pixinest_auth_password').val(),
                },
                success: function (res) {
                    if (res.success) {
                        $result.addClass('success').text(res.data.message);
                    } else {
                        $result.addClass('error').text(res.data.message);
                    }
                },
                error: function () {
                    $result.addClass('error').text('Errore di rete. Riprova.');
                },
                complete: function () {
                    $btn.prop('disabled', false).removeClass('pixinest-loading');
                },
            });
        });

        // Fetch System Prompt from Backend (GET)
        $('#pixinest-fetch-prompt').on('click', function () {
            var $btn = $(this);
            var $result = $('#pixinest-prompt-result');

            $btn.prop('disabled', true).addClass('pixinest-loading');
            $result.removeClass('success error').text('Caricamento dal backend...');

            $.ajax({
                url: pixinestAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pixinest_fetch_system_prompt',
                    nonce: pixinestAdmin.nonce,
                },
                success: function (res) {
                    if (res.success) {
                        $('#pixinest_system_prompt').val(res.data.systemPrompt || '');
                        var label = res.data.isDefault ? ' (default)' : '';
                        var timeInfo = '';
                        if (res.data.updatedAt) {
                            var d = new Date(res.data.updatedAt);
                            timeInfo = ' — Ultimo aggiornamento: ' + d.toLocaleString('it-IT');
                        }
                        $result.addClass('success').text('✅ Caricato' + label + timeInfo);
                    } else {
                        $result.addClass('error').text(res.data.message);
                    }
                },
                error: function () {
                    $result.addClass('error').text('Errore di rete. Riprova.');
                },
                complete: function () {
                    $btn.prop('disabled', false).removeClass('pixinest-loading');
                },
            });
        });

        // Update System Prompt (POST)
        $('#pixinest-update-prompt').on('click', function () {
            var $btn = $(this);
            var $result = $('#pixinest-prompt-result');
            var prompt = $('#pixinest_system_prompt').val().trim();

            if (!prompt) {
                $result.addClass('error').text('Il system prompt non può essere vuoto.');
                return;
            }

            $btn.prop('disabled', true).addClass('pixinest-loading');
            $result.removeClass('success error').text('Invio in corso...');

            $.ajax({
                url: pixinestAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pixinest_update_system_prompt',
                    nonce: pixinestAdmin.nonce,
                    system_prompt: prompt,
                },
                success: function (res) {
                    if (res.success) {
                        $result.addClass('success').text(res.data.message);
                    } else {
                        $result.addClass('error').text(res.data.message);
                    }
                },
                error: function () {
                    $result.addClass('error').text('Errore di rete. Riprova.');
                },
                complete: function () {
                    $btn.prop('disabled', false).removeClass('pixinest-loading');
                },
            });
        });
    });
})(jQuery);
