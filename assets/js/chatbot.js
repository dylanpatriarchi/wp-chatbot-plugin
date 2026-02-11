/**
 * RayoChat Widget
 * iMessage-inspired frontend chat with localStorage persistence and proxy
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'rayochat_data';
    var config = window.rayochatConfig || {};

    // ─── State ──────────────────────────────────────────
    var chatId = null;
    var messages = [];
    var isOpen = false;
    var isSending = false;

    // ─── Init ───────────────────────────────────────────
    function init() {
        loadFromStorage();
        buildDOM();
        renderMessages();

        if (messages.length === 0 && config.welcomeMessage) {
            addMessage('bot', config.welcomeMessage);
        }
    }

    // ─── LocalStorage ──────────────────────────────────
    function loadFromStorage() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var data = JSON.parse(raw);
                chatId = data.chatId || generateChatId();
                messages = Array.isArray(data.messages) ? data.messages : [];
            } else {
                chatId = generateChatId();
                messages = [];
            }
        } catch (e) {
            chatId = generateChatId();
            messages = [];
        }
    }

    function saveToStorage() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ chatId: chatId, messages: messages })
            );
        } catch (e) {
            console.warn('RayoChat: Could not save to localStorage', e);
        }
    }

    function generateChatId() {
        return 'rc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    }

    // ─── DOM Construction ──────────────────────────────
    function buildDOM() {
        var root = document.getElementById('rc-root');
        if (!root) return;

        // FAB icon: custom image or default SVG
        var fabContent = '';
        if (config.fabIcon) {
            fabContent = '<img class="rc-fab-img" src="' + escapeHtml(config.fabIcon) + '" alt="Chat" />';
        } else {
            fabContent = '<svg class="rc-fab-icon rc-fab-icon--chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
        }

        // Avatar in header: custom image or default SVG
        var avatarContent = '';
        if (config.fabIcon) {
            avatarContent = '<img src="' + escapeHtml(config.fabIcon) + '" alt="" />';
        } else {
            avatarContent = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
        }

        // Powered by footer
        var poweredByClass = 'rc-powered-by' + (config.hidePoweredBy ? ' rc-powered-by--hidden' : '');
        var poweredByHtml = '<div class="' + poweredByClass + '">Powered by <a href="https://www.rayo.consulting" target="_blank" rel="noopener noreferrer">Rayo Consulting</a></div>';

        root.innerHTML = '' +
            '<button class="rc-fab" id="rc-fab" aria-label="Apri chat">' +
            fabContent +
            '<svg class="rc-fab-icon rc-fab-icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>' +
            '<div class="rc-window" id="rc-window">' +
            '<div class="rc-header">' +
            '<div class="rc-header-info">' +
            '<div class="rc-avatar">' + avatarContent + '</div>' +
            '<div>' +
            '<span class="rc-title">' + escapeHtml(config.botName || 'RayoChat') + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="rc-header-actions">' +
            '<button class="rc-header-btn" id="rc-clear" title="Cancella conversazione"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>' +
            '<button class="rc-header-btn" id="rc-close" title="Chiudi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></button>' +
            '</div>' +
            '</div>' +
            '<div class="rc-messages" id="rc-messages"></div>' +
            '<div class="rc-input-area">' +
            '<div class="rc-input-wrapper">' +
            '<textarea id="rc-input" placeholder="Scrivi un messaggio..." rows="1" maxlength="2000"></textarea>' +
            '<button id="rc-send" class="rc-send-btn" disabled aria-label="Invia"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
            '</div>' +
            poweredByHtml +
            '</div>' +
            '</div>';

        // Event Listeners
        var fab = document.getElementById('rc-fab');
        var input = document.getElementById('rc-input');
        var sendBtn = document.getElementById('rc-send');
        var closeBtn = document.getElementById('rc-close');
        var clearBtn = document.getElementById('rc-clear');

        fab.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        clearBtn.addEventListener('click', function () {
            if (confirm('Vuoi cancellare la conversazione?')) {
                messages = [];
                chatId = generateChatId();
                saveToStorage();
                renderMessages();
                if (config.welcomeMessage) {
                    addMessage('bot', config.welcomeMessage);
                }
            }
        });

        input.addEventListener('input', function () {
            sendBtn.disabled = !this.value.trim();
            autoResize(this);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendBtn.addEventListener('click', sendMessage);

        // Visual Viewport handling for mobile keyboard
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportResize);
            window.visualViewport.addEventListener('scroll', handleViewportResize);
        }
    }

    // ─── Viewport Resize (Mobile Keyboard) ─────────────
    function handleViewportResize() {
        if (!isOpen) return;

        // Only apply on mobile-ish screens
        if (window.innerWidth > 480) {
            var windowEl = document.getElementById('rc-window');
            if (windowEl) {
                windowEl.style.height = '';
                windowEl.style.bottom = '';
            }
            return;
        }

        var windowEl = document.getElementById('rc-window');
        if (!windowEl) return;

        // Adjust height to match the visual viewport
        var viewportHeight = window.visualViewport.height;
        var offsetTop = window.visualViewport.offsetTop;

        // Force position to match the visual viewport exactly
        // This prevents the "slide up" effect where the window goes off-screen
        windowEl.style.height = viewportHeight + 'px';
        windowEl.style.top = offsetTop + 'px';
        windowEl.style.bottom = 'auto'; // Disable CSS bottom positioning

        // Ensure standard CSS doesn't fight back
        windowEl.style.position = 'fixed';

        // Scroll messages to bottom to keep context visible
        setTimeout(scrollToBottom, 50);
    }

    // ─── Chat Toggle ───────────────────────────────────
    function toggleChat() {
        isOpen = !isOpen;
        var root = document.getElementById('rc-root');
        if (isOpen) {
            root.classList.add('rc-open');
            setTimeout(function () {
                scrollToBottom();
                var input = document.getElementById('rc-input');
                if (input) input.focus();
            }, 350);
        } else {
            root.classList.remove('rc-open');
        }
    }

    // ─── Render Messages ───────────────────────────────
    function renderMessages() {
        var container = document.getElementById('rc-messages');
        if (!container) return;

        container.innerHTML = '';
        messages.forEach(function (msg, i) {
            container.appendChild(createMessageEl(msg, i === messages.length - 1));
        });
        scrollToBottom();
    }

    function createMessageEl(msg, isLatest) {
        var wrapper = document.createElement('div');
        wrapper.className = 'rc-msg rc-msg--' + msg.role;
        if (isLatest) wrapper.classList.add('rc-msg--new');

        var bubble = document.createElement('div');
        bubble.className = 'rc-bubble';
        bubble.innerHTML = formatMessage(msg.content);

        var time = document.createElement('span');
        time.className = 'rc-msg-time';
        time.textContent = formatTime(msg.timestamp);

        wrapper.appendChild(bubble);
        wrapper.appendChild(time);
        return wrapper;
    }

    function addMessage(role, content) {
        // Safety: ensure content is a string
        if (typeof content === 'object' && content !== null) {
            content = content.text || content.output || content.content || content.response || JSON.stringify(content);
        }

        var msg = {
            role: role,
            content: String(content || ''),
            timestamp: Date.now()
        };
        messages.push(msg);
        saveToStorage();

        var container = document.getElementById('rc-messages');
        if (container) {
            container.querySelectorAll('.rc-msg--new').forEach(function (el) {
                el.classList.remove('rc-msg--new');
            });
            container.appendChild(createMessageEl(msg, true));
            scrollToBottom();
        }
    }

    // ─── Send Message ──────────────────────────────────
    function sendMessage() {
        if (isSending) return;

        var input = document.getElementById('rc-input');
        var text = input.value.trim();
        if (!text) return;

        addMessage('user', text);
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('rc-send').disabled = true;

        showTyping();
        isSending = true;

        // Build request
        var url = config.proxyUrl || config.webhookUrl || '';
        var headers = { 'Content-Type': 'application/json' };

        if (config.proxyUrl && config.nonce) {
            headers['X-WP-Nonce'] = config.nonce;
        } else if (config.authUser || config.authPass) {
            headers['Authorization'] = 'Basic ' + btoa((config.authUser || '') + ':' + (config.authPass || ''));
        }

        fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                message: text,
                chatId: chatId
            })
        })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                hideTyping();

                // Handle array response
                var responseData = Array.isArray(data) ? data[0] : data;

                // Extract response text
                var responseText = responseData.response || responseData.output || responseData.text || '';

                // If still an object, dig deeper
                if (typeof responseText === 'object' && responseText !== null) {
                    responseText = responseText.text || responseText.output || responseText.content || JSON.stringify(responseText);
                }

                if (!responseText && responseText !== 0) {
                    responseText = 'Nessuna risposta ricevuta dal backend.';
                }

                addMessage('bot', responseText);

                var newChatId = responseData.chatId || responseData.sessionId;
                if (newChatId && newChatId !== chatId) {
                    chatId = newChatId;
                    saveToStorage();
                }
            })
            .catch(function (err) {
                hideTyping();
                console.error('RayoChat error:', err);
                addMessage('bot', '⚠️ Si è verificato un errore. Riprova tra un momento.');
            })
            .finally(function () {
                isSending = false;
            });
    }

    // ─── Typing Indicator ──────────────────────────────
    function showTyping() {
        var container = document.getElementById('rc-messages');
        if (!container) return;

        var el = document.createElement('div');
        el.className = 'rc-msg rc-msg--bot rc-msg--new';
        el.id = 'rc-typing';

        el.innerHTML = '<div class="rc-bubble rc-typing">' +
            '<span class="rc-dot"></span>' +
            '<span class="rc-dot"></span>' +
            '<span class="rc-dot"></span>' +
            '</div>';

        container.appendChild(el);
        scrollToBottom();
    }

    function hideTyping() {
        var el = document.getElementById('rc-typing');
        if (el) el.remove();
    }

    // ─── Utilities ─────────────────────────────────────
    function scrollToBottom() {
        var container = document.getElementById('rc-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /**
     * Format message text with markdown-like rendering
     * Supports: **bold**, *italic*, `code`, lists, line breaks, emoji
     */
    function formatMessage(text) {
        if (!text) return '';

        // Fix escaped quotes from backend
        text = text.replace(/\\"/g, '"');
        text = text.replace(/\\n/g, '\n');

        // Escape HTML first
        var escaped = escapeHtml(text);

        // Bold  **text**
        escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Italic *text*
        escaped = escaped.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Inline code `text`
        escaped = escaped.replace(/`(.+?)`/g, '<code>$1</code>');

        // Numbered lists: lines starting with "1. ", "2. " etc.
        escaped = escaped.replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>');

        // Bulleted lists: lines starting with "- " or "• "
        escaped = escaped.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');

        // Wrap consecutive <li> in <ul>
        escaped = escaped.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Line breaks (after list handling)
        escaped = escaped.replace(/\n/g, '<br>');

        // Clean up <br> right after <ul> or before </ul>
        escaped = escaped.replace(/<br><ul>/g, '<ul>');
        escaped = escaped.replace(/<\/ul><br>/g, '</ul>');
        escaped = escaped.replace(/<br><\/li>/g, '</li>');

        return escaped;
    }

    function formatTime(ts) {
        var d = new Date(ts);
        return d.getHours().toString().padStart(2, '0') + ':' +
            d.getMinutes().toString().padStart(2, '0');
    }

    // ─── Start ─────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
