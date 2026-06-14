/**
 * chatbot.js — ArtBot AI powered by Google Gemini
 * Tích hợp Gemini 2.0 Flash để trả lời thông minh về nghệ thuật
 */

(function () {
    'use strict';

    // ══════════════════════════════════════════════
    //  CẤU HÌNH — Thay YOUR_API_KEY bằng key thật
    // ══════════════════════════════════════════════
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
    const GEMINI_MODEL   = 'gemini-2.0-flash';

    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    // System prompt — định nghĩa tính cách ArtBot
    const SYSTEM_PROMPT = `Bạn là ArtBot, trợ lý AI của ArtGallery — một triển lãm nghệ thuật trực tuyến Việt Nam.
Nhiệm vụ của bạn:
- Hỗ trợ người dùng khám phá, tìm hiểu về các tác phẩm nghệ thuật và họa sĩ.
- Tư vấn về các phong cách nghệ thuật (sơn dầu, màu nước, tranh lụa, v.v.).
- Giải thích ý nghĩa, kỹ thuật, lịch sử nghệ thuật một cách thú vị và dễ hiểu.
- Trả lời câu hỏi về cách sử dụng website ArtGallery (đăng nhập, gửi tác phẩm, xem bộ sưu tập).
- Luôn thân thiện, nhiệt tình, đam mê nghệ thuật.
- Trả lời ngắn gọn (tối đa 3-4 câu), tự nhiên bằng tiếng Việt.
- Khi không biết thông tin cụ thể về một tác phẩm nào đó, hãy nói thật và gợi ý tìm kiếm.
- Không bịa đặt thông tin về giá cả hoặc tác phẩm cụ thể.`;

    // Lịch sử hội thoại để Gemini hiểu ngữ cảnh
    let conversationHistory = [];

    // ══════════════════════════════════════════════
    //  DOM References
    // ══════════════════════════════════════════════
    let widget, toggler, closeBtn, sendBtn, inputEl, bodyEl, quickRepliesEl;

    // ══════════════════════════════════════════════
    //  Khởi tạo
    // ══════════════════════════════════════════════
    function init() {
        widget        = document.getElementById('chatbot-widget');
        toggler       = document.getElementById('chatbot-toggler');
        closeBtn      = document.getElementById('chatbot-close');
        sendBtn       = document.getElementById('chatbot-send');
        inputEl       = document.getElementById('chatbot-input');
        bodyEl        = document.getElementById('chatbot-body');
        quickRepliesEl = document.getElementById('chatbot-quick-replies');

        if (!widget) return;

        // Toggle mở/đóng
        toggler.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        // Gửi tin nhắn
        sendBtn.addEventListener('click', handleSend);
        inputEl.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // Quick reply chips
        if (quickRepliesEl) {
            quickRepliesEl.addEventListener('click', function (e) {
                var chip = e.target.closest('.qr-chip');
                if (chip) {
                    var text = chip.dataset.msg;
                    inputEl.value = text;
                    handleSend();
                }
            });
        }

        // Hiện badge số tin nhắn mới sau 3 giây
        setTimeout(function () {
            if (!widget.classList.contains('open')) {
                toggler.classList.add('has-badge');
            }
        }, 3000);
    }

    // ══════════════════════════════════════════════
    //  Mở / Đóng chat window
    // ══════════════════════════════════════════════
    function toggleChat() {
        widget.classList.toggle('open');
        toggler.classList.remove('has-badge');
        if (widget.classList.contains('open')) {
            inputEl.focus();
            bodyEl.scrollTop = bodyEl.scrollHeight;
        }
    }

    // ══════════════════════════════════════════════
    //  Xử lý gửi tin nhắn
    // ══════════════════════════════════════════════
    function handleSend() {
        var text = inputEl.value.trim();
        if (!text) return;

        inputEl.value = '';
        sendBtn.disabled = true;
        inputEl.disabled = true;

        // Ẩn quick replies sau lần gửi đầu
        if (quickRepliesEl) quickRepliesEl.style.display = 'none';

        addMessage(text, 'user');
        showTyping();

        // Gọi Gemini API
        callGemini(text)
            .then(function (reply) {
                removeTyping();
                addMessage(reply, 'bot');
            })
            .catch(function (err) {
                removeTyping();
                var fallback = getFallbackResponse(text);
                addMessage(fallback, 'bot');
                console.warn('Gemini error, dùng fallback:', err);
            })
            .finally(function () {
                sendBtn.disabled = false;
                inputEl.disabled = false;
                inputEl.focus();
            });
    }

    // ══════════════════════════════════════════════
    //  Gọi Google Gemini API
    // ══════════════════════════════════════════════
    function callGemini(userText) {
        // Thêm vào lịch sử hội thoại
        conversationHistory.push({ role: 'user', parts: [{ text: userText }] });

        // Giới hạn lịch sử tối đa 10 lượt
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        var requestBody = {
            system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 256,
                topP: 0.9
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
            ]
        };

        return fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })
        .then(function (res) {
            if (!res.ok) {
                return res.json().then(function (err) {
                    throw new Error(err.error ? err.error.message : 'HTTP ' + res.status);
                });
            }
            return res.json();
        })
        .then(function (data) {
            var reply = data.candidates
                && data.candidates[0]
                && data.candidates[0].content
                && data.candidates[0].content.parts
                && data.candidates[0].content.parts[0]
                && data.candidates[0].content.parts[0].text;

            if (!reply) throw new Error('Empty response from Gemini');

            // Lưu phản hồi vào lịch sử
            conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
            return reply.trim();
        });
    }

    // ══════════════════════════════════════════════
    //  Fallback khi không có mạng / API lỗi
    // ══════════════════════════════════════════════
    function getFallbackResponse(text) {
        var q = text.toLowerCase();
        if (q.includes('chào') || q.includes('hi') || q.includes('hello')) {
            return 'Chào bạn! Tôi là ArtBot 🎨 Rất vui được gặp bạn. Bạn muốn khám phá tác phẩm nào hôm nay?';
        }
        if (q.includes('tác giả') || q.includes('họa sĩ')) {
            return 'Bạn có thể gõ tên tác giả vào thanh tìm kiếm để xem toàn bộ tác phẩm của họ nhé!';
        }
        if (q.includes('mua') || q.includes('giá')) {
            return 'ArtGallery hiện tập trung triển lãm trực tuyến. Tính năng đặt mua sẽ sớm ra mắt!';
        }
        if (q.includes('đăng ký') || q.includes('tài khoản')) {
            return 'Bạn có thể đăng ký tài khoản ngay trên trang Đăng nhập để gửi tác phẩm và lưu yêu thích!';
        }
        return 'Xin lỗi, tôi đang gặp sự cố kết nối. Bạn thử lại sau nhé hoặc dùng thanh tìm kiếm để tìm tác phẩm! 🙏';
    }

    // ══════════════════════════════════════════════
    //  Thêm tin nhắn vào giao diện
    // ══════════════════════════════════════════════
    function addMessage(text, sender) {
        var wrapper = document.createElement('div');
        wrapper.className = 'chat-msg-wrapper ' + sender + '-wrapper';

        var bubble = document.createElement('div');
        bubble.className = 'chat-msg ' + (sender === 'user' ? 'user-msg' : 'bot-msg');

        // Render xuống dòng và links đơn giản
        bubble.innerHTML = formatText(text);

        var time = document.createElement('span');
        time.className = 'chat-time';
        time.textContent = getTime();

        wrapper.appendChild(bubble);
        wrapper.appendChild(time);
        bodyEl.appendChild(wrapper);
        bodyEl.scrollTop = bodyEl.scrollHeight;

        // Animation entrance
        requestAnimationFrame(function () {
            wrapper.classList.add('visible');
        });
    }

    // ══════════════════════════════════════════════
    //  Typing indicator (3 chấm nhảy)
    // ══════════════════════════════════════════════
    function showTyping() {
        var typing = document.createElement('div');
        typing.className = 'chat-msg-wrapper bot-wrapper typing-wrapper';
        typing.id = 'typing-indicator';
        typing.innerHTML = '<div class="chat-msg bot-msg typing-indicator"><span></span><span></span><span></span></div>';
        bodyEl.appendChild(typing);
        bodyEl.scrollTop = bodyEl.scrollHeight;
        requestAnimationFrame(function () { typing.classList.add('visible'); });
    }

    function removeTyping() {
        var el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    // ══════════════════════════════════════════════
    //  Helpers
    // ══════════════════════════════════════════════
    function formatText(text) {
        // Escape HTML
        var escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        // Xuống dòng
        return escaped.replace(/\n/g, '<br>');
    }

    function getTime() {
        var now = new Date();
        return now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    }

    // ══════════════════════════════════════════════
    //  Khởi chạy khi DOM sẵn sàng
    // ══════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
