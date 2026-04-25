document.addEventListener('DOMContentLoaded', () => {
    const learnForm = document.getElementById('learn-form');
    const topicInput = document.getElementById('topic-input');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const learnBtn = document.getElementById('learn-btn');
    
    const lessonContent = document.getElementById('lesson-content');
    const lessonActions = document.getElementById('lesson-actions');
    const completeBtn = document.getElementById('complete-btn');
    const progressList = document.getElementById('progress-list');

    let currentTopic = '';

    // Fetch initial progress on load
    fetchProgress();

    learnForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const topic = topicInput.value.trim();
        if (!topic) return;

        setLoading(true);
        currentTopic = topic;

        try {
            const response = await fetch('/api/learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) throw new Error('Failed to fetch lesson');

            const data = await response.json();
            
            // Render markdown content
            lessonContent.innerHTML = marked.parse(data.content);
            lessonContent.classList.remove('empty');
            lessonContent.classList.add('fade-in');
            
            // Show actions
            lessonActions.classList.remove('hidden');

            // Optionally, fetch progress again to reflect that they started a topic
            fetchProgress();

        } catch (error) {
            console.error(error);
            lessonContent.innerHTML = `<p style="color: #ef4444;">Error generating lesson. Please try again.</p>`;
        } finally {
            setLoading(false);
        }
    });

    completeBtn.addEventListener('click', async () => {
        if (!currentTopic) return;
        
        completeBtn.disabled = true;
        completeBtn.textContent = 'Saving...';

        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: currentTopic, completed: true })
            });

            if (!response.ok) throw new Error('Failed to update progress');

            completeBtn.textContent = 'Completed! 🎉';
            completeBtn.classList.replace('success-btn', 'primary-btn');
            
            // Refresh progress list
            fetchProgress();

            setTimeout(() => {
                completeBtn.disabled = false;
                completeBtn.textContent = 'Mark as Completed';
                completeBtn.classList.replace('primary-btn', 'success-btn');
                lessonActions.classList.add('hidden');
                topicInput.value = '';
                topicInput.focus();
                lessonContent.innerHTML = '<p class="placeholder-text">Great job! Enter a new topic to continue learning.</p>';
                lessonContent.classList.add('empty');
            }, 2000);

        } catch (error) {
            console.error(error);
            completeBtn.textContent = 'Error. Try again.';
            completeBtn.disabled = false;
        }
    });

    async function fetchProgress() {
        try {
            const response = await fetch('/api/progress');
            if (!response.ok) throw new Error('Failed to fetch progress');
            
            const data = await response.json();
            renderProgress(data);
        } catch (error) {
            console.error('Error fetching progress:', error);
            progressList.innerHTML = '<li>Error loading progress.</li>';
        }
    }

    function renderProgress(progressData) {
        progressList.innerHTML = '';
        
        if (progressData.length === 0) {
            progressList.innerHTML = '<li class="placeholder-text" style="font-size: 0.9rem; color: var(--text-secondary);">No topics learned yet. Start exploring!</li>';
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
                <div class="progress-level">
                    <span class="level-badge">Lvl ${item.level}</span>
                    <span>${levelLabel}</span>
                </div>
            `;
            progressList.appendChild(li);
        });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            learnBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            learnBtn.disabled = false;
        }
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
