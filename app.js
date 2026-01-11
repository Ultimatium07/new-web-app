/**
 * NEXUS QUANTUM APEX - Main Application
 * World's Most Advanced Super App
 */

class NexusApp {
    constructor() {
        this.state = {
            user: {
                id: null,
                name: 'Quantum User',
                avatar: 'https://ui-avatars.com/api/?name=Quantum&background=00ffff&color=000&size=100',
                level: 1,
                xp: 0,
                gold: 100,
                energy: 1000,
                maxEnergy: 1000,
                tier: 'Standard',
                streak: 0,
                achievements: [],
                stats: {
                    totalTaps: 0,
                    totalQuizzes: 0,
                    battleWins: 0,
                    filesAnalyzed: 0
                }
            },
            mining: {
                tapPower: 1,
                autoMining: 0,
                criticalChance: 10,
                combo: 0,
                lastTapTime: 0,
                upgrades: {
                    tap: { level: 1, cost: 10 },
                    energy: { level: 1, cost: 50 },
                    auto: { level: 0, cost: 100 },
                    critical: { level: 1, cost: 25 }
                }
            },
            quiz: {
                currentQuestion: null,
                score: 0,
                category: 'general',
                questions: []
            },
            battle: {
                room: null,
                opponent: null,
                status: 'waiting'
            }
        };
        
        this.intervals = {};
        this.currentSection = 'mining';
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing NEXUS QUANTUM APEX...');
        
        // Initialize Telegram WebApp
        this.initTelegram();
        
        // Load saved data
        this.loadUserData();
        
        // Setup UI
        this.setupUI();
        
        // Start game loops
        this.startGameLoops();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateUI();
        
        // Track analytics
        if (window.analytics) {
            window.analytics.trackEvent('app_initialized');
        }
        
        console.log('✅ NEXUS QUANTUM APEX Ready!');
    }
    
    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            // Enable features
            tg.ready();
            tg.expand();
            tg.enableClosingConfirmation();
            
            // Get user data
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                const user = tg.initDataUnsafe.user;
                this.state.user.id = user.id;
                this.state.user.name = user.first_name + ' ' + (user.last_name || '');
                this.state.user.avatar = user.photo_url || this.state.user.avatar;
            }
            
            // Setup theme
            if (tg.themeParams) {
                this.applyTelegramTheme(tg.themeParams);
            }
            
            // Setup main button
            tg.MainButton.text = 'Sync with Bot';
            tg.MainButton.onClick(() => this.syncWithBot());
            
            // Setup back button
            tg.BackButton.onClick(() => this.goBack());
            
            console.log('📱 Telegram WebApp initialized');
        }
    }
    
    applyTelegramTheme(theme) {
        const root = document.documentElement;
        
        if (theme.bg_color) {
            root.style.setProperty('--bg-primary', theme.bg_color);
        }
        if (theme.text_color) {
            root.style.setProperty('--text-primary', theme.text_color);
        }
        if (theme.hint_color) {
            root.style.setProperty('--text-secondary', theme.hint_color);
        }
        if (theme.button_color) {
            root.style.setProperty('--quantum-cyan', theme.button_color);
        }
    }
    
    setupUI() {
        // Setup mining core
        const core = document.getElementById('quantumCore');
        if (core) {
            core.addEventListener('click', (e) => this.handleMining(e));
        }
        
        // Setup navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchSection(item.dataset.section);
            });
        });
        
        // Setup settings
        this.setupSettings();
        
        // Setup file upload
        this.setupFileUpload();
    }
    
    setupSettings() {
        // Notification toggle
        const notifToggle = document.getElementById('notificationsToggle');
        if (notifToggle) {
            notifToggle.addEventListener('change', (e) => {
                this.state.settings = this.state.settings || {};
                this.state.settings.notifications = e.target.checked;
                this.saveUserData();
            });
        }
        
        // Sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.state.settings = this.state.settings || {};
                this.state.settings.sound = e.target.checked;
                this.saveUserData();
            });
        }
        
        // Haptic toggle
        const hapticToggle = document.getElementById('hapticToggle');
        if (hapticToggle) {
            hapticToggle.addEventListener('change', (e) => {
                this.state.settings = this.state.settings || {};
                this.state.settings.haptic = e.target.checked;
                this.saveUserData();
            });
        }
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadArea && fileInput) {
            // Click to upload
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            // File selection
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
            
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
        }
    }
    
    startGameLoops() {
        // Energy regeneration
        this.intervals.energy = setInterval(() => {
            if (this.state.user.energy < this.state.user.maxEnergy) {
                this.state.user.energy = Math.min(
                    this.state.user.energy + 1,
                    this.state.user.maxEnergy
                );
                this.updateUI();
            }
        }, 1000);
        
        // Auto mining
        this.intervals.autoMining = setInterval(() => {
            if (this.state.mining.autoMining > 0) {
                this.addXP(this.state.mining.autoMining, 'auto_mining');
            }
        }, 1000);
        
        // Save data
        this.intervals.save = setInterval(() => {
            this.saveUserData();
        }, 30000);
    }
    
    setupEventListeners() {
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.saveUserData();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.goBack();
            }
        });
    }
    
    // ==================== MINING SYSTEM ====================
    
    handleMining(e) {
        const now = Date.now();
        const timeDiff = now - this.state.mining.lastTapTime;
        
        // Check energy
        if (this.state.user.energy < 1) {
            this.showToast('Not enough energy!', 'error');
            this.triggerHaptic('error');
            return;
        }
        
        // Use energy
        this.state.user.energy -= 1;
        
        // Calculate combo
        if (timeDiff < 500) {
            this.state.mining.combo = Math.min(this.state.mining.combo + 1, 10);
        } else {
            this.state.mining.combo = 1;
        }
        
        this.state.mining.lastTapTime = now;
        
        // Calculate reward
        let baseReward = this.state.mining.tapPower;
        let multiplier = 1;
        
        // Combo multiplier
        if (this.state.mining.combo > 1) {
            multiplier = 1 + (this.state.mining.combo * 0.1);
        }
        
        // Critical hit
        const isCritical = Math.random() * 100 < this.state.mining.criticalChance;
        if (isCritical) {
            multiplier *= 2;
            this.createCriticalEffect(e);
        }
        
        const finalReward = Math.floor(baseReward * multiplier);
        
        // Add rewards
        this.addXP(finalReward, 'mining');
        this.addGold(Math.floor(finalReward / 10), 'mining');
        
        // Update stats
        this.state.user.stats.totalTaps++;
        
        // Visual effects
        this.createTapEffect(e);
        this.updateCombo();
        
        // Haptic feedback
        this.triggerHaptic(isCritical ? 'heavy' : 'light');
        
        // Update UI
        this.updateUI();
    }
    
    createTapEffect(e) {
        if (!window.quantumEffects) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        window.quantumEffects.createExplosion(x, y, 10);
        window.quantumEffects.createFloatingText(
            `+${this.state.mining.tapPower}`,
            e.clientX,
            e.clientY,
            '#00ffff'
        );
    }
    
    createCriticalEffect(e) {
        if (!window.quantumEffects) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        window.quantumEffects.createExplosion(x, y, 30);
        window.quantumEffects.createFloatingText(
            'CRITICAL!',
            e.clientX,
            e.clientY,
            '#ffd700'
        );
    }
    
    updateCombo() {
        const comboEl = document.getElementById('comboCount');
        if (comboEl) {
            comboEl.textContent = this.state.mining.combo;
            
            if (this.state.mining.combo >= 5) {
                comboEl.style.color = '#ffd700';
            } else if (this.state.mining.combo >= 3) {
                comboEl.style.color = '#ff00ff';
            } else {
                comboEl.style.color = '#ffffff';
            }
        }
    }
    
    // ==================== QUIZ SYSTEM ====================
    
    startQuiz() {
        const category = document.querySelector('.category-card.active')?.dataset.category || 'general';
        
        // Generate questions
        this.generateQuizQuestions(category);
        
        // Show first question
        this.showQuizQuestion(0);
        
        // Track analytics
        if (window.analytics) {
            window.analytics.trackEvent('quiz_started', { category });
        }
    }
    
    generateQuizQuestions(category) {
        // Mock questions - in real app, fetch from API
        this.state.quiz.questions = [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2
            },
            {
                question: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                correct: 1
            },
            // Add more questions...
        ];
        
        this.state.quiz.currentQuestion = 0;
        this.state.quiz.score = 0;
    }
    
    showQuizQuestion(index) {
        const question = this.state.quiz.questions[index];
        if (!question) return;
        
        const quizArea = document.getElementById('quizArea');
        if (!quizArea) return;
        
        quizArea.innerHTML = `
            <div class="quiz-question">
                <div class="quiz-progress">
                    Question ${index + 1} of ${this.state.quiz.questions.length}
                </div>
                <h3>${question.question}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, i) => `
                        <button class="quiz-option" onclick="NexusApp.answerQuiz(${i})">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    answerQuiz(answerIndex) {
        const question = this.state.quiz.questions[this.state.quiz.currentQuestion];
        const isCorrect = answerIndex === question.correct;
        
        if (isCorrect) {
            this.state.quiz.score++;
            this.addXP(10, 'quiz');
            this.showToast('Correct! +10 XP', 'success');
        } else {
            this.showToast('Wrong answer!', 'error');
        }
        
        // Show next question or results
        this.state.quiz.currentQuestion++;
        
        if (this.state.quiz.currentQuestion < this.state.quiz.questions.length) {
            this.showQuizQuestion(this.state.quiz.currentQuestion);
        } else {
            this.showQuizResults();
        }
    }
    
    showQuizResults() {
        const quizArea = document.getElementById('quizArea');
        if (!quizArea) return;
        
        const scorePercent = Math.round((this.state.quiz.score / this.state.quiz.questions.length) * 100);
        const xpReward = this.state.quiz.score * 10;
        const goldReward = this.state.quiz.score * 5;
        
        this.addXP(xpReward, 'quiz_completed');
        this.addGold(goldReward, 'quiz_completed');
        
        quizArea.innerHTML = `
            <div class="quiz-results">
                <h3>Quiz Complete!</h3>
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-percent">${scorePercent}%</span>
                    </div>
                    <p>You got ${this.state.quiz.score} out of ${this.state.quiz.questions.length} correct!</p>
                </div>
                <div class="rewards">
                    <p>+${xpReward} XP</p>
                    <p>+${goldReward} Gold</p>
                </div>
                <button class="quantum-button" onclick="NexusApp.resetQuiz()">
                    Play Again
                </button>
            </div>
        `;
        
        // Update stats
        this.state.user.stats.totalQuizzes++;
        
        // Track analytics
        if (window.analytics) {
            window.analytics.trackEvent('quiz_completed', {
                score: scorePercent,
                category: this.state.quiz.category
            });
        }
    }
    
    resetQuiz() {
        const quizArea = document.getElementById('quizArea');
        if (!quizArea) return;
        
        quizArea.innerHTML = `
            <div class="quiz-start">
                <div class="quiz-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <h3>Test Your Knowledge!</h3>
                <p>Challenge yourself with AI-generated questions</p>
                <div class="quiz-options">
                    <button class="quantum-button primary" onclick="NexusApp.startQuiz()">
                        <i class="fas fa-play"></i> Start Quiz
                    </button>
                </div>
            </div>
        `;
    }
    
    // ==================== BATTLE SYSTEM ====================
    
    createBattleRoom() {
        this.showToast('Creating battle room...', 'info');
        // Implement room creation
    }
    
    joinBattleRoom() {
        const roomId = prompt('Enter room code:');
        if (roomId) {
            this.showToast('Joining room...', 'info');
            // Implement room joining
        }
    }
    
    quickMatch() {
        this.showToast('Finding opponent...', 'info');
        // Implement quick match
    }
    
    // ==================== FILE SYSTEM ====================
    
    handleFiles(files) {
        Array.from(files).forEach(file => {
            this.processFile(file);
        });
    }
    
    processFile(file) {
        // Show processing
        this.showToast(`Processing ${file.name}...`, 'info');
        
        // Simulate processing
        setTimeout(() => {
            const analysis = {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.type,
                result: 'Analysis complete!'
            };
            
            this.showAnalysisResult(analysis);
            this.addXP(5, 'file_analysis');
            
            // Update stats
            this.state.user.stats.filesAnalyzed++;
            
            // Track analytics
            if (window.analytics) {
                window.analytics.trackEvent('file_analyzed', {
                    type: file.type,
                    size: file.size
                });
            }
        }, 2000);
    }
    
    showAnalysisResult(analysis) {
        const resultsEl = document.getElementById('analysisResults');
        if (!resultsEl) return;
        
        const resultCard = document.createElement('div');
        resultCard.className = 'analysis-card';
        resultCard.innerHTML = `
            <div class="analysis-header">
                <i class="fas fa-file"></i>
                <span>${analysis.name}</span>
            </div>
            <div class="analysis-details">
                <p>Size: ${analysis.size}</p>
                <p>Type: ${analysis.type}</p>
                <p class="result">${analysis.result}</p>
            </div>
        `;
        
        resultsEl.appendChild(resultCard);
    }
    
    // ==================== GAMIFICATION ====================
    
    addXP(amount, source = 'unknown') {
        this.state.user.xp += amount;
        
        // Check level up
        const newLevel = this.calculateLevel(this.state.user.xp);
        if (newLevel > this.state.user.level) {
            this.levelUp(newLevel);
        }
        
        // Update gamification
        if (window.gamification) {
            window.gamification.addXP(amount, source);
        }
    }
    
    addGold(amount, source = 'unknown') {
        this.state.user.gold += amount;
        
        // Update gamification
        if (window.gamification) {
            window.gamification.addGold(amount, source);
        }
    }
    
    calculateLevel(xp) {
        // Simple level formula
        return Math.floor(xp / 100) + 1;
    }
    
    levelUp(newLevel) {
        const levelsGained = newLevel - this.state.user.level;
        this.state.user.level = newLevel;
        
        // Rewards
        const goldReward = levelsGained * 50;
        const energyReward = levelsGained * 100;
        
        this.state.user.gold += goldReward;
        this.state.user.maxEnergy += energyReward;
        this.state.user.energy += energyReward;
        
        // Show notification
        this.showToast(`🎉 LEVEL UP! Now level ${newLevel}! +${goldReward} Gold`, 'success');
        
        // Create effect
        if (window.quantumEffects) {
            window.quantumEffects.createExplosion(
                window.innerWidth / 2,
                window.innerHeight / 2,
                50
            );
        }
        
        // Haptic feedback
        this.triggerHaptic('heavy');
    }
    
    // ==================== UI MANAGEMENT ====================
    
    updateUI() {
        // Update header stats
        this.updateElement('userXP', this.formatNumber(this.state.user.xp));
        this.updateElement('userGold', this.formatNumber(this.state.user.gold));
        this.updateElement('userEnergy', this.state.user.energy);
        this.updateElement('userLevel', this.state.user.level);
        this.updateElement('userStreak', this.state.user.streak);
        
        // Update progress bars
        this.updateProgressBars();
        
        // Update mining stats
        this.updateElement('totalTaps', this.formatNumber(this.state.user.stats.totalTaps));
        this.updateElement('tapPower', this.state.mining.tapPower);
        this.updateElement('autoMining', this.state.mining.autoMining);
        
        // Update profile
        this.updateProfile();
    }
    
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    updateProgressBars() {
        // XP progress
        const xpProgress = document.getElementById('xpProgress');
        if (xpProgress) {
            const currentLevelXP = (this.state.user.level - 1) * 100;
            const nextLevelXP = this.state.user.level * 100;
            const progress = ((this.state.user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
            xpProgress.style.width = progress + '%';
            
            const xpText = document.getElementById('xpProgressText');
            if (xpText) {
                xpText.textContent = `${this.state.user.xp - currentLevelXP} / ${nextLevelXP - currentLevelXP}`;
            }
        }
        
        // Energy progress
        const energyFill = document.getElementById('energyFill');
        if (energyFill) {
            const progress = (this.state.user.energy / this.state.user.maxEnergy) * 100;
            energyFill.style.width = progress + '%';
            
            const energyText = document.getElementById('energyProgressText');
            if (energyText) {
                energyText.textContent = `${this.state.user.energy} / ${this.state.user.maxEnergy}`;
            }
        }
    }
    
    updateProfile() {
        this.updateElement('profileName', this.state.user.name);
        this.updateElement('profileLevel', this.state.user.level);
        this.updateElement('profileXP', this.formatNumber(this.state.user.xp));
        this.updateElement('profileGold', this.formatNumber(this.state.user.gold));
        this.updateElement('profileAchievements', this.state.user.achievements.length);
        this.updateElement('profileBattles', this.state.user.stats.battleWins);
    }
    
    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
        
        // Update sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}Section`)?.classList.add('active');
        
        this.currentSection = sectionName;
        
        // Track analytics
        if (window.analytics) {
            window.analytics.trackEvent('navigation', { section: sectionName });
        }
    }
    
    // ==================== DATA MANAGEMENT ====================
    
    saveUserData() {
        const data = {
            state: this.state,
            timestamp: Date.now()
        };
        
        localStorage.setItem('nexus_quantum_apex', JSON.stringify(data));
        
        // Sync with bot if available
        if (window.BotIntegration) {
            window.BotIntegration.sendDataToBot('sync', data);
        }
    }
    
    loadUserData() {
        const saved = localStorage.getItem('nexus_quantum_apex');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data.state };
            } catch (e) {
                console.error('Failed to load user data:', e);
            }
        }
    }
    
    syncWithBot() {
        if (window.BotIntegration) {
            window.BotIntegration.syncWithBot();
            this.showToast('Synced with bot!', 'success');
        } else {
            this.showToast('Bot integration not available', 'error');
        }
    }
    
    // ==================== UTILITIES ====================
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
    
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    triggerHaptic(type = 'light') {
        if (window.Telegram?.WebApp?.HapticFeedback) {
            switch (type) {
                case 'light':
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    break;
                case 'medium':
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                    break;
                case 'heavy':
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
                    break;
                case 'error':
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                    break;
                case 'success':
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                    break;
            }
        }
    }
    
    pauseGame() {
        // Clear intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
    
    resumeGame() {
        // Restart game loops
        this.startGameLoops();
    }
    
    goBack() {
        if (window.Telegram?.WebApp?.BackButton.isVisible) {
            window.Telegram.WebApp.close();
        } else if (this.currentSection !== 'mining') {
            this.switchSection('mining');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.NexusApp = new NexusApp();
});

// Global functions for inline handlers
window.startQuiz = () => window.NexusApp?.startQuiz();
window.createBattleRoom = () => window.NexusApp?.createBattleRoom();
window.joinBattleRoom = () => window.NexusApp?.joinBattleRoom();
window.quickMatch = () => window.NexusApp?.quickMatch();
window.openCamera = () => {
    // Implement camera opening
    window.NexusApp?.showToast('Camera feature coming soon!', 'info');
};
window.selectFromGallery = () => {
    document.getElementById('fileInput')?.click();
};
window.selectDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.multiple = true;
    input.onchange = (e) => window.NexusApp?.handleFiles(e.target.files);
    input.click();
};
window.selectAudio = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = (e) => window.NexusApp?.handleFiles(e.target.files);
    input.click();
};
window.shareProfile = () => {
    if (navigator.share) {
        navigator.share({
            title: 'NEXUS QUANTUM APEX',
            text: 'Check out my profile!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        window.NexusApp?.showToast('Link copied!', 'success');
    }
};
window.editProfile = () => {
    window.NexusApp?.showToast('Profile editing coming soon!', 'info');
};
window.changeAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('profileAvatar');
                if (img) img.src = e.target.result;
                window.NexusApp?.showToast('Avatar updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
};
window.viewAllAchievements = () => {
    window.NexusApp?.showToast('Achievements page coming soon!', 'info');
};
window.practiceMode = () => {
    window.NexusApp?.showToast('Practice mode coming soon!', 'info');
};
window.tournamentMode = () => {
    window.NexusApp?.showToast('Tournament mode coming soon!', 'info');
};
window.closeModal = () => {
    document.getElementById('modalContainer')?.classList.remove('show');
};
