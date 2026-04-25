document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const topicInput = document.getElementById('topic-input');
    const chatBox = document.getElementById('chat-box');
    const welcomeScreen = document.getElementById('welcome-screen');
    const progressList = document.getElementById('progress-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    const langSelect = document.getElementById('language-select');

    let currentTopic = '';

    // Fetch progress on load
    fetchProgress();

    newChatBtn.addEventListener('click', () => {
        chatBox.innerHTML = '';
        chatBox.appendChild(welcomeScreen);
        welcomeScreen.style.display = 'block';
        topicInput.focus();
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const topic = topicInput.value.trim();
        if (!topic) return;

        // Hide welcome screen
        welcomeScreen.style.display = 'none';

        // Add user message
        appendMessage('user', topic);
        topicInput.value = '';
        currentTopic = topic;
        const language = langSelect.value;

        // Show typing indicator
        const typingId = showTypingIndicator();

        try {
            const response = await fetch('/api/learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, language })
            });

            removeTypingIndicator(typingId);

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch lesson');
            }

            const data = await response.json();
            
            // Add bot message with markdown
            appendMessage('bot', data.content, true, data.topic);
            
            // Update progress list
            fetchProgress();

        } catch (error) {
            removeTypingIndicator(typingId);
            appendMessage('bot', `**Error:** ${error.message}. Please try again.`, true);
        }
    });

    function appendMessage(sender, text, isMarkdown = false, topicContext = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;

        let contentHtml = '';
        if (sender === 'bot') {
            contentHtml += `<div class="bot-avatar"><span class="material-icons-outlined" style="font-size: 18px;">auto_awesome</span></div>`;
        }

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble markdown-body';
        
        if (isMarkdown) {
            bubbleDiv.innerHTML = marked.parse(text);
            
            if (topicContext) {
                const btn = document.createElement('button');
                btn.className = 'mark-complete-btn';
                btn.textContent = 'Mark as Completed';
                btn.onclick = () => markCompleted(topicContext, btn);
                bubbleDiv.appendChild(btn);
            }
        } else {
            bubbleDiv.textContent = text;
        }

        msgDiv.appendChild(contentHtml ? new DOMParser().parseFromString(contentHtml, 'text/html').body.firstChild : document.createTextNode(''));
        if(sender === 'bot') {
            msgDiv.innerHTML = contentHtml;
        }
        msgDiv.appendChild(bubbleDiv);
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.id = id;
        
        msgDiv.innerHTML = `
            <div class="bot-avatar"><span class="material-icons-outlined" style="font-size: 18px;">auto_awesome</span></div>
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    async function markCompleted(topic, btn) {
        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, completed: true })
            });

            if (!response.ok) throw new Error('Failed to update progress');

            btn.textContent = 'Completed! 🎉';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            
            fetchProgress();
        } catch (error) {
            btn.textContent = 'Error. Try again.';
            btn.disabled = false;
        }
    }

    async function fetchProgress() {
        try {
            const response = await fetch('/api/progress');
            if (!response.ok) throw new Error('Failed to fetch progress');
            
            const data = await response.json();
            renderProgress(data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    }

    function renderProgress(progressData) {
        progressList.innerHTML = '';
        
        if (progressData.length === 0) {
            progressList.innerHTML = '<li style="color: var(--text-secondary); font-size: 0.8rem; padding: 1rem;">No topics yet.</li>';
            return;
        }

        progressData.forEach(item => {
            const li = document.createElement('li');
            li.className = 'progress-item';
            
            let levelLabel = 'Beginner';
            if (item.level === 2) levelLabel = 'Intermediate';
            if (item.level >= 3) levelLabel = 'Advanced';

            li.innerHTML = `
                <div class="progress-topic">${escapeHTML(item.topic)}</div>
                <div class="progress-level">Level ${item.level} • ${levelLabel}</div>
            `;
            
            li.addEventListener('click', () => {
                topicInput.value = item.topic;
                chatForm.dispatchEvent(new Event('submit'));
            });

            progressList.appendChild(li);
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }
});
