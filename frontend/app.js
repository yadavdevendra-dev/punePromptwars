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
                const completeBtn = document.createElement('button');
                completeBtn.className = 'mark-complete-btn';
                completeBtn.textContent = 'Mark as Completed';
                completeBtn.onclick = () => markCompleted(topicContext, completeBtn);
                bubbleDiv.appendChild(completeBtn);

                const saveBtn = document.createElement('button');
                saveBtn.className = 'mark-complete-btn';
                saveBtn.style.marginLeft = '10px';
                saveBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">cloud_upload</span> Save to Cloud';
                saveBtn.onclick = () => saveToCloud(topicContext, text, saveBtn);
                bubbleDiv.appendChild(saveBtn);

                const playBtn = document.createElement('button');
                playBtn.className = 'mark-complete-btn';
                playBtn.style.marginLeft = '10px';
                playBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">volume_up</span> Play Audio';
                playBtn.onclick = () => playAudio(text, langSelect.value, playBtn);
                bubbleDiv.appendChild(playBtn);
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

    async function saveToCloud(topic, content, btn) {
        btn.disabled = true;
        btn.innerHTML = 'Saving...';

        try {
            const response = await fetch('/api/storage/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, content })
            });

            if (!response.ok) throw new Error('Failed to save to cloud');

            const data = await response.json();
            btn.innerHTML = `<a href="${data.url}" target="_blank" style="color: inherit; text-decoration: none;">Saved! (View)</a>`;
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
        } catch (error) {
            btn.innerHTML = 'Error. Try again.';
            btn.disabled = false;
        }
    }

    async function playAudio(text, language, btn) {
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">hourglass_empty</span> Loading...';

        try {
            const response = await fetch('/api/tts/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language })
            });

            if (!response.ok) throw new Error('Failed to load audio');

            const data = await response.json();
            const audio = new Audio("data:audio/mp3;base64," + data.audio);
            audio.play();
            
            btn.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">volume_up</span> Playing...';
            
            audio.onended = () => {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            };
        } catch (error) {
            btn.innerHTML = 'Audio Error';
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }, 2000);
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
