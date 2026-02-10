/**
 * PixiNest Chatbot Widget
 * Frontend chat with localStorage persistence and n8n integration
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'pixinest_chat_data';
    const config = window.pixinestConfig || {};

    // ─── State ──────────────────────────────────────────
    let chatId = null;
    let messages = [];
    let isOpen = false;
    let isSending = false;

    // ─── Init ───────────────────────────────────────────
    function init() {
        loadFromStorage();
        buildDOM();
        renderMessages();

        // Add welcome message if history is empty
        if (messages.length === 0 && config.welcomeMessage) {
            addMessage('bot', config.welcomeMessage);
        }
    }

    // ─── LocalStorage ──────────────────────────────────
    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
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
                JSON.stringify({ chatId, messages })
            );
        } catch (e) {
            console.warn('PixiNest: Could not save to localStorage', e);
        }
    }

    function generateChatId() {
        return 'pxn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    }

    // ─── DOM Construction ──────────────────────────────
    function buildDOM() {
        const root = document.getElementById('pixinest-chatbot-root');
        if (!root) return;

        root.innerHTML = `
      <button class="pixinest-fab" id="pixinest-fab" aria-label="Apri chat">
        <svg class="pixinest-fab-icon pixinest-fab-icon--chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        <svg class="pixinest-fab-icon pixinest-fab-icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="pixinest-chat-window" id="pixinest-chat-window">
        <div class="pixinest-chat-header">
          <div class="pixinest-chat-header-info">
            <div class="pixinest-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </div>
            <div>
              <span class="pixinest-chat-title">${escapeHtml(config.botName || 'PixiNest')}</span>
              <span class="pixinest-chat-subtitle">Online</span>
            </div>
          </div>
          <div class="pixinest-chat-header-actions">
            <button class="pixinest-header-btn" id="pixinest-clear-chat" title="Cancella conversazione">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <button class="pixinest-header-btn" id="pixinest-close-chat" title="Chiudi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="pixinest-chat-messages" id="pixinest-messages"></div>

        <div class="pixinest-chat-input-area">
          <div class="pixinest-input-wrapper">
            <textarea id="pixinest-input"
                      placeholder="Scrivi un messaggio..."
                      rows="1"
                      maxlength="2000"></textarea>
            <button id="pixinest-send" class="pixinest-send-btn" disabled aria-label="Invia">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div class="pixinest-powered-by">Powered by PixiNest AI</div>
        </div>
      </div>
    `;

        // Event Listeners
        const fab = document.getElementById('pixinest-fab');
        const chatWindow = document.getElementById('pixinest-chat-window');
        const input = document.getElementById('pixinest-input');
        const sendBtn = document.getElementById('pixinest-send');
        const closeBtn = document.getElementById('pixinest-close-chat');
        const clearBtn = document.getElementById('pixinest-clear-chat');

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
    }

    // ─── Chat Toggle ───────────────────────────────────
    function toggleChat() {
        isOpen = !isOpen;
        const root = document.getElementById('pixinest-chatbot-root');
        if (isOpen) {
            root.classList.add('pixinest-open');
            setTimeout(function () {
                scrollToBottom();
                var input = document.getElementById('pixinest-input');
                if (input) input.focus();
            }, 350);
        } else {
            root.classList.remove('pixinest-open');
        }
    }

    // ─── Render Messages ───────────────────────────────
    function renderMessages() {
        const container = document.getElementById('pixinest-messages');
        if (!container) return;

        container.innerHTML = '';
        messages.forEach(function (msg, i) {
            container.appendChild(createMessageEl(msg, i === messages.length - 1));
        });
        scrollToBottom();
    }

    function createMessageEl(msg, isLatest) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pixinest-msg pixinest-msg--' + msg.role;
        if (isLatest) wrapper.classList.add('pixinest-msg--new');

        const bubble = document.createElement('div');
        bubble.className = 'pixinest-msg-bubble';
        bubble.innerHTML = formatMessage(msg.content);

        const time = document.createElement('span');
        time.className = 'pixinest-msg-time';
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

        const msg = {
            role: role,
            content: String(content || ''),
            timestamp: Date.now()
        };
        messages.push(msg);
        saveToStorage();

        const container = document.getElementById('pixinest-messages');
        if (container) {
            // Remove "new" class from previous messages
            container.querySelectorAll('.pixinest-msg--new').forEach(function (el) {
                el.classList.remove('pixinest-msg--new');
            });
            container.appendChild(createMessageEl(msg, true));
            scrollToBottom();
        }
    }

    // ─── Send Message ──────────────────────────────────
    function sendMessage() {
        if (isSending) return;

        const input = document.getElementById('pixinest-input');
        const text = input.value.trim();
        if (!text) return;

        // Add user message
        addMessage('user', text);
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('pixinest-send').disabled = true;

        // Show typing indicator
        showTyping();

        isSending = true;

        // Build request — use proxyUrl (WP REST proxy) if available, fallback to webhookUrl
        var url = config.proxyUrl || config.webhookUrl || '';
        var headers = { 'Content-Type': 'application/json' };

        if (config.proxyUrl && config.nonce) {
            // WP REST API — same-origin, no CORS
            headers['X-WP-Nonce'] = config.nonce;
        } else if (config.authUser || config.authPass) {
            // Direct webhook fallback (for test page)
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

                // 1. Handle n8n array response (take first item)
                let responseData = Array.isArray(data) ? data[0] : data;

                // 2. Extract response text using common keys
                let responseText = responseData.response || responseData.output || responseData.text || '';

                // 3. If responseText is still an object, dig deeper
                if (typeof responseText === 'object' && responseText !== null) {
                    responseText = responseText.text || responseText.output || responseText.content || JSON.stringify(responseText);
                }

                // 4. Default message if nothing found
                if (!responseText && responseText !== 0) {
                    responseText = 'Nessuna risposta ricevuta dal backend.';
                }

                addMessage('bot', responseText);

                // Sync chatId if backend returned one
                const newChatId = responseData.chatId || responseData.sessionId;
                if (newChatId && newChatId !== chatId) {
                    chatId = newChatId;
                    saveToStorage();
                }
            })
            .catch(function (err) {
                hideTyping();
                console.error('PixiNest chat error:', err);
                addMessage('bot', '⚠️ Si è verificato un errore. Riprova tra un momento.');
            })
            .finally(function () {
                isSending = false;
            });
    }

    // ─── Typing Indicator ──────────────────────────────
    function showTyping() {
        const container = document.getElementById('pixinest-messages');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'pixinest-msg pixinest-msg--bot pixinest-msg--new';
        el.id = 'pixinest-typing';

        el.innerHTML = `
      <div class="pixinest-msg-bubble pixinest-typing">
        <span class="pixinest-dot"></span>
        <span class="pixinest-dot"></span>
        <span class="pixinest-dot"></span>
      </div>
    `;

        container.appendChild(el);
        scrollToBottom();
    }

    function hideTyping() {
        const el = document.getElementById('pixinest-typing');
        if (el) el.remove();
    }

    // ─── Utilities ─────────────────────────────────────
    function scrollToBottom() {
        const container = document.getElementById('pixinest-messages');
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

    function formatMessage(text) {
        // Basic markdown-like formatting
        var escaped = escapeHtml(text);
        // Bold
        escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        escaped = escaped.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Inline code
        escaped = escaped.replace(/`(.+?)`/g, '<code>$1</code>');
        // Line breaks
        escaped = escaped.replace(/\n/g, '<br>');
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
