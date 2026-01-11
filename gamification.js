/**
 * NEXUS QUANTUM APEX - Gamification Engine
 * XP, Levels, Achievements, Leaderboards, Streaks
 */

class GamificationEngine {
    constructor() {
        this.user = {
            id: null,
            level: 1,
            xp: 0,
            gold: 0,
            energy: 1000,
            maxEnergy: 1000,
            streak: 0,
            lastLogin: null,
            achievements: [],
            stats: {
                totalTaps: 0,
                totalQuizzes: 0,
                totalBattles: 0,
                totalFiles: 0,
                perfectQuizzes: 0,
                battleWins: 0,
                criticalHits: 0,
                maxCombo: 0
            }
        };
        
        this.achievements = this.initAchievements();
        this.leaderboard = {
            weekly: [],
            monthly: [],
            allTime: []
        };
        
        this.dailyChallenges = [];
        this.seasonPass = {
            level: 0,
            xp: 0,
            rewards: []
        };
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.generateDailyChallenges();
        this.checkStreak();
        this.startAutoSave();
        this.initEventListeners();
    }
    
    // ==================== XP & LEVEL SYSTEM ====================
    
    addXP(amount, source = 'unknown') {
        const oldLevel = this.user.level;
        this.user.xp += amount;
        
        // Check level up
        const newLevel = this.calculateLevel(this.user.xp);
        if (newLevel > oldLevel) {
            this.levelUp(newLevel - oldLevel);
        }
        
        // Update leaderboards
        this.updateLeaderboard('weekly', amount);
        this.updateLeaderboard('monthly', amount);
        
        // Show floating text
        if (window.quantumEffects) {
            const rect = document.getElementById('userXP')?.getBoundingClientRect();
            if (rect) {
                window.quantumEffects.createFloatingText(
                    `+${formatNumber(amount)} XP`,
                    rect.left + rect.width / 2,
                    rect.top,
                    '#ffd700'
                );
            }
        }
        
        // Update UI
        this.updateUI();
        this.saveUserData();
        
        // Check achievements
        this.checkAchievements();
        
        // Track stats
        this.trackActivity(source);
    }
    
    calculateLevel(xp) {
        // Level formula: 100 * 1.5^(level-1)
        let level = 1;
        let requiredXP = 100;
        
        while (xp >= requiredXP) {
            level++;
            requiredXP = Math.floor(100 * Math.pow(1.5, level - 1));
        }
        
        return level;
    }
    
    getXPForNextLevel() {
        const nextLevel = this.user.level + 1;
        return Math.floor(100 * Math.pow(1.5, nextLevel - 1));
    }
    
    getXPProgress() {
        const currentLevelXP = Math.floor(100 * Math.pow(1.5, this.user.level - 1));
        const nextLevelXP = this.getXPForNextLevel();
        const progress = (this.user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
        return Math.min(progress, 1);
    }
    
    levelUp(levels) {
        this.user.level += levels;
        
        // Rewards for level up
        const goldReward = levels * 50 * this.user.level;
        const energyReward = levels * 100;
        
        this.user.gold += goldReward;
        this.user.maxEnergy += energyReward;
        this.user.energy = Math.min(this.user.energy + energyReward, this.user.maxEnergy);
        
        // Show level up modal
        this.showLevelUpModal(levels, goldReward);
        
        // Create celebration effect
        if (window.quantumEffects) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            window.quantumEffects.createExplosion(centerX, centerY, 50);
        }
        
        // Haptic feedback
        if (window.hapticFeedback) {
            window.hapticFeedback('heavy');
        }
    }
    
    // ==================== GOLD SYSTEM ====================
    
    addGold(amount, source = 'unknown') {
        this.user.gold += amount;
        
        // Show floating text
        if (window.quantumEffects) {
            const rect = document.getElementById('userGold')?.getBoundingClientRect();
            if (rect) {
                window.quantumEffects.createFloatingText(
                    `+${formatNumber(amount)} Gold`,
                    rect.left + rect.width / 2,
                    rect.top,
                    '#ffd700'
                );
            }
        }
        
        this.updateUI();
        this.saveUserData();
    }
    
    spendGold(amount) {
        if (this.user.gold >= amount) {
            this.user.gold -= amount;
            this.updateUI();
            this.saveUserData();
            return true;
        }
        return false;
    }
    
    // ==================== ENERGY SYSTEM ====================
    
    useEnergy(amount) {
        if (this.user.energy >= amount) {
            this.user.energy -= amount;
            this.updateUI();
            this.saveUserData();
            return true;
        }
        return false;
    }
    
    regenerateEnergy() {
        if (this.user.energy < this.user.maxEnergy) {
            this.user.energy = Math.min(this.user.energy + 1, this.user.maxEnergy);
            this.updateUI();
        }
    }
    
    // ==================== STREAK SYSTEM ====================
    
    checkStreak() {
        const today = new Date().toDateString();
        const lastLogin = this.user.lastLogin;
        
        if (lastLogin) {
            const lastDate = new Date(lastLogin);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                this.user.streak++;
                this.giveStreakReward();
            } else if (diffDays > 1) {
                // Streak broken
                this.user.streak = 0;
            }
        }
        
        this.user.lastLogin = today;
        this.saveUserData();
    }
    
    giveStreakReward() {
        const rewards = {
            1: { gold: 10, xp: 50 },
            7: { gold: 100, xp: 500 },
            30: { gold: 500, xp: 2500 },
            100: { gold: 2000, xp: 10000 }
        };
        
        const reward = rewards[this.user.streak] || { gold: 10, xp: 50 };
        
        this.addGold(reward.gold, 'streak');
        this.addXP(reward.xp, 'streak');
        
        showToast(`🔥 Streak Day ${this.user.streak}! +${reward.gold} Gold, +${reward.xp} XP`, 'success');
    }
    
    // ==================== ACHIEVEMENTS ====================
    
    initAchievements() {
        return [
            // Mining achievements
            { id: 'first_tap', name: '⚡ First Tap', desc: 'Make your first tap', xp: 10, check: () => this.user.stats.totalTaps >= 1 },
            { id: 'tap_100', name: '⚡ Tapper', desc: 'Tap 100 times', xp: 50, check: () => this.user.stats.totalTaps >= 100 },
            { id: 'tap_1000', name: '⚡ Tap Master', desc: 'Tap 1000 times', xp: 200, check: () => this.user.stats.totalTaps >= 1000 },
            { id: 'tap_10000', name: '⚡ Tap Legend', desc: 'Tap 10000 times', xp: 1000, check: () => this.user.stats.totalTaps >= 10000 },
            
            // Quiz achievements
            { id: 'first_quiz', name: '🧠 Quiz Beginner', desc: 'Complete your first quiz', xp: 25, check: () => this.user.stats.totalQuizzes >= 1 },
            { id: 'quiz_10', name: '🧠 Quiz Taker', desc: 'Complete 10 quizzes', xp: 100, check: () => this.user.stats.totalQuizzes >= 10 },
            { id: 'quiz_perfect', name: '💯 Perfect Score', desc: 'Get 100% on a quiz', xp: 150, check: () => this.user.stats.perfectQuizzes >= 1 },
            
            // Battle achievements
            { id: 'first_battle', name: '⚔️ First Battle', desc: 'Enter your first battle', xp: 25, check: () => this.user.stats.totalBattles >= 1 },
            { id: 'battle_win', name: '🏆 First Victory', desc: 'Win your first battle', xp: 100, check: () => this.user.stats.battleWins >= 1 },
            { id: 'battle_10', name: '⚔️ Warrior', desc: 'Win 10 battles', xp: 300, check: () => this.user.stats.battleWins >= 10 },
            
            // File achievements
            { id: 'first_file', name: '📁 First Upload', desc: 'Upload your first file', xp: 25, check: () => this.user.stats.totalFiles >= 1 },
            { id: 'file_10', name: '📊 Analyst', desc: 'Analyze 10 files', xp: 150, check: () => this.user.stats.totalFiles >= 10 },
            
            // Level achievements
            { id: 'level_5', name: '📈 Rising Star', desc: 'Reach level 5', xp: 100, check: () => this.user.level >= 5 },
            { id: 'level_10', name: '📈 Quantum Master', desc: 'Reach level 10', xp: 300, check: () => this.user.level >= 10 },
            { id: 'level_25', name: '📈 Quantum Legend', desc: 'Reach level 25', xp: 1000, check: () => this.user.level >= 25 },
            
            // Gold achievements
            { id: 'gold_100', name: '💰 Gold Collector', desc: 'Collect 100 gold', xp: 50, check: () => this.user.gold >= 100 },
            { id: 'gold_1000', name: '💰 Gold Hoarder', desc: 'Collect 1000 gold', xp: 300, check: () => this.user.gold >= 1000 },
            
            // Streak achievements
            { id: 'streak_7', name: '🔥 Weekly Warrior', desc: '7 day streak', xp: 200, check: () => this.user.streak >= 7 },
            { id: 'streak_30', name: '🔥 Monthly Master', desc: '30 day streak', xp: 1000, check: () => this.user.streak >= 30 },
            
            // Special achievements
            { id: 'critical_10', name: '💥 Critical Master', desc: 'Get 10 critical hits', xp: 100, check: () => this.user.stats.criticalHits >= 10 },
            { id: 'combo_10', name: '🔥 Combo King', desc: 'Reach 10x combo', xp: 200, check: () => this.user.stats.maxCombo >= 10 }
        ];
    }
    
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!this.user.achievements.includes(achievement.id) && achievement.check()) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    unlockAchievement(achievement) {
        this.user.achievements.push(achievement.id);
        this.addXP(achievement.xp, 'achievement');
        
        // Show achievement notification
        this.showAchievementNotification(achievement);
        
        // Create celebration effect
        if (window.quantumEffects) {
            const rect = document.getElementById('achievements')?.getBoundingClientRect();
            if (rect) {
                window.quantumEffects.createExplosion(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    20
                );
            }
        }
        
        // Haptic feedback
        if (window.hapticFeedback) {
            window.hapticFeedback('heavy');
        }
        
        this.saveUserData();
    }
    
    // ==================== DAILY CHALLENGES ====================
    
    generateDailyChallenges() {
        const templates = [
            { type: 'tap', target: 100, reward: { xp: 50, gold: 10 } },
            { type: 'quiz', target: 3, reward: { xp: 150, gold: 30 } },
            { type: 'battle', target: 1, reward: { xp: 100, gold: 20 } },
            { type: 'file', target: 1, reward: { xp: 75, gold: 15 } },
            { type: 'xp', target: 500, reward: { xp: 100, gold: 25 } },
            { type: 'gold', target: 50, reward: { xp: 75, gold: 50 } }
        ];
        
        // Check if we need new challenges
        const today = new Date().toDateString();
        const saved = localStorage.getItem('nexus_daily_challenges_date');
        
        if (saved !== today) {
            // Generate new challenges
            this.dailyChallenges = templates
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)
                .map(template => ({
                    ...template,
                    progress: 0,
                    completed: false
                }));
            
            localStorage.setItem('nexus_daily_challenges_date', today);
            localStorage.setItem('nexus_daily_challenges', JSON.stringify(this.dailyChallenges));
        } else {
            // Load saved challenges
            const saved = localStorage.getItem('nexus_daily_challenges');
            if (saved) {
                this.dailyChallenges = JSON.parse(saved);
            }
        }
    }
    
    updateDailyChallenge(type, amount) {
        const challenge = this.dailyChallenges.find(c => c.type === type && !c.completed);
        if (challenge) {
            challenge.progress = Math.min(challenge.progress + amount, challenge.target);
            
            if (challenge.progress >= challenge.target && !challenge.completed) {
                challenge.completed = true;
                this.addXP(challenge.reward.xp, 'daily');
                this.addGold(challenge.reward.gold, 'daily');
                
                showToast(`✅ Daily Challenge Complete! +${challenge.reward.xp} XP, +${challenge.reward.gold} Gold`, 'success');
            }
            
            this.saveDailyChallenges();
        }
    }
    
    // ==================== LEADERBOARD ====================
    
    updateLeaderboard(type, xp) {
        // This would normally sync with server
        // For now, just update local
        const entry = {
            userId: this.user.id,
            name: this.user.name || 'Quantum User',
            xp: this.user.xp,
            level: this.user.level,
            gold: this.user.gold
        };
        
        // Update local leaderboard
        if (!this.leaderboard[type].find(e => e.userId === this.user.id)) {
            this.leaderboard[type].push(entry);
        } else {
            const index = this.leaderboard[type].findIndex(e => e.userId === this.user.id);
            this.leaderboard[type][index] = entry;
        }
        
        // Sort by XP
        this.leaderboard[type].sort((a, b) => b.xp - a.xp);
        
        // Keep top 100
        this.leaderboard[type] = this.leaderboard[type].slice(0, 100);
    }
    
    getLeaderboard(type) {
        return this.leaderboard[type] || [];
    }
    
    getUserRank(type) {
        const index = this.leaderboard[type].findIndex(e => e.userId === this.user.id);
        return index >= 0 ? index + 1 : null;
    }
    
    // ==================== UI METHODS ====================
    
    updateUI() {
        // Update XP
        const xpEl = document.getElementById('userXP');
        if (xpEl) xpEl.textContent = formatNumber(this.user.xp);
        
        // Update level
        const levelEl = document.getElementById('userLevel');
        if (levelEl) levelEl.textContent = this.user.level;
        
        // Update gold
        const goldEl = document.getElementById('userGold');
        if (goldEl) goldEl.textContent = formatNumber(this.user.gold);
        
        // Update energy
        const energyEl = document.getElementById('userEnergy');
        if (energyEl) energyEl.textContent = this.user.energy;
        
        // Update energy bar
        const energyBar = document.getElementById('energyFill');
        if (energyBar) {
            const percent = (this.user.energy / this.user.maxEnergy) * 100;
            energyBar.style.width = percent + '%';
        }
        
        // Update XP progress bar
        const xpBar = document.getElementById('xpProgress');
        if (xpBar) {
            xpBar.style.width = (this.getXPProgress() * 100) + '%';
        }
        
        // Update achievements count
        const achievementsEl = document.getElementById('achievements');
        if (achievementsEl) achievementsEl.textContent = this.user.achievements.length;
        
        // Update streak
        const streakEl = document.getElementById('userStreak');
        if (streakEl) streakEl.textContent = this.user.streak;
    }
    
    showLevelUpModal(levels, gold) {
        const content = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                <h2 style="color: var(--quantum-gold); margin-bottom: 10px;">LEVEL UP!</h2>
                <p style="font-size: 24px; margin-bottom: 20px;">Level ${this.user.level}</p>
                <div style="background: var(--bg-glass); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p>🎁 Rewards:</p>
                    <p>+${gold} Gold</p>
                    <p>+${levels * 100} Max Energy</p>
                </div>
                <button class="btn-primary" onclick="closeModal()">Awesome!</button>
            </div>
        `;
        
        showModal('🎉 LEVEL UP!', content);
    }
    
    showAchievementNotification(achievement) {
        showToast(`🏆 Achievement Unlocked: ${achievement.name}! +${achievement.xp} XP`, 'success');
    }
    
    // ==================== DATA MANAGEMENT ====================
    
    saveUserData() {
        const data = {
            user: this.user,
            achievements: this.user.achievements,
            lastSaved: Date.now()
        };
        
        localStorage.setItem('nexus_gamification', JSON.stringify(data));
        
        // Sync with bot if available
        if (window.BotIntegration) {
            window.BotIntegration.sendDataToBot('gamification_update', data);
        }
    }
    
    loadUserData() {
        const saved = localStorage.getItem('nexus_gamification');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.user = { ...this.user, ...data.user };
                this.user.achievements = data.achievements || [];
            } catch (e) {
                console.error('Failed to load gamification data:', e);
            }
        }
    }
    
    saveDailyChallenges() {
        localStorage.setItem('nexus_daily_challenges', JSON.stringify(this.dailyChallenges));
    }
    
    startAutoSave() {
        setInterval(() => {
            this.saveUserData();
        }, 30000); // Auto-save every 30 seconds
    }
    
    // ==================== TRACKING ====================
    
    trackActivity(source) {
        switch (source) {
            case 'mining':
                this.user.stats.totalTaps++;
                break;
            case 'quiz':
                this.user.stats.totalQuizzes++;
                break;
            case 'battle':
                this.user.stats.totalBattles++;
                break;
            case 'file':
                this.user.stats.totalFiles++;
                break;
            case 'critical':
                this.user.stats.criticalHits++;
                break;
        }
    }
    
    // ==================== EVENT LISTENERS ====================
    
    initEventListeners() {
        // Listen for visibility change to check streak
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkStreak();
            }
        });
    }
}

// Utility function
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gamification = new GamificationEngine();
});

// Export for use in other modules
window.GamificationEngine = GamificationEngine;
