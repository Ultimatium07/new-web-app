/* ═══════════════════════════════════════════════════════════════════
   NEXUS MEDIA - CYBERPUNK WEBAPP JAVASCRIPT
   Full Interactive Implementation
   ═══════════════════════════════════════════════════════════════════ */

// ═══════════ TELEGRAM WEBAPP ═══════════
const tg = window.Telegram?.WebApp;
let userData = null;

// ═══════════ HAPTIC FEEDBACK ═══════════
const Haptic = {
    light: () => tg?.HapticFeedback?.impactOccurred('light'),
    medium: () => tg?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => tg?.HapticFeedback?.impactOccurred('heavy'),
    success: () => tg?.HapticFeedback?.notificationOccurred('success'),
    error: () => tg?.HapticFeedback?.notificationOccurred('error'),
    warning: () => tg?.HapticFeedback?.notificationOccurred('warning')
};

// ═══════════ INITIALIZATION ═══════════
document.addEventListener('DOMContentLoaded', () => {
    // Security: Disable right-click
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        showSecurityAlert();
    });

    // Initialize Telegram WebApp
    if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#050505');
        tg.setBackgroundColor('#050505');
    }

    // Parse user data from URL or Telegram
    initUserData();

    // Hide loader after animation
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('app').classList.add('visible');
    }, 2500);
});

// ═══════════ USER DATA ═══════════
function initUserData() {
    // Try to get from Telegram
    if (tg?.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        userData = {
            id: tgUser.id,
            name: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
            username: tgUser.username,
            photo: tgUser.photo_url,
            xp: 0,
            gold: 100,
            level: 1,
            streak: 0,
            isPremium: tgUser.is_premium || false
        };
    } else {
        // Demo data
        userData = getDemoData();
    }

    // Try to get encrypted payload from URL
    const urlParams = new URLSearchParams(window.location.search);
    const payload = urlParams.get('payload');
    if (payload) {
        try {
            const decrypted = decryptPayload(payload);
            if (decrypted) {
                userData = { ...userData, ...decrypted };
            }
        } catch (e) {
            console.error('Payload decryption failed:', e);
        }
    }

    populateUI();
}

function getDemoData() {
    return {
        id: 123456789,
        name: 'Asadbek',
        username: 'asadbekjon',
        xp: 1815,
        gold: 2500,
        level: 5,
        streak: 7,
        isPremium: false,
        levelProgress: 65,
        quizzesCompleted: 42,
        correctRate: 78
    };
}

function decryptPayload(encrypted) {
    try {
        const AES_KEY = 'nexus_secret_key_32bytes_long!!';
        const bytes = CryptoJS.AES.decrypt(encrypted, AES_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        return null;
    }
}

function populateUI() {
    if (!userData) return;

    document.getElementById('userName').textContent = userData.name || 'Foydalanuvchi';
    document.getElementById('userLevel').textContent = `Level ${userData.level || 1}`;
    document.getElementById('xpValue').textContent = formatNumber(userData.xp || 0);
    document.getElementById('streakValue').textContent = userData.streak || 0;
    document.getElementById('levelNum').textContent = userData.level || 1;

    // Update progress bar
    const progress = userData.levelProgress || 35;
    document.getElementById('rpgProgress').style.width = `${progress}%`;

    // Premium avatar glow
    if (userData.isPremium) {
        document.querySelectorAll('.avatar-ring-1, .avatar-ring-2, .avatar-ring-3').forEach(ring => {
            ring.classList.add('avatar-ring-premium');
        });
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ═══════════ TAB SWITCHING ═══════════
function switchTab(tabName) {
    Haptic.light();

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ═══════════ HERO BUTTON: AI QUIZ ═══════════
function openAIQuiz() {
    Haptic.medium();
    
    // Ripple effect
    createRipple(event, 'var(--neon-green)');
    
    // Send to bot
    sendData({ action: 'open_ai_quiz' });
    
    // Show AI Quiz interface
    setTimeout(() => {
        showOverlay('aiQuiz');
    }, 300);
}

// ═══════════ LIVE BATTLE ═══════════
function openLobby() {
    Haptic.heavy();
    
    // Particle explosion
    createParticleExplosion(event);
    
    sendData({ action: 'join_live_battle' });
    
    setTimeout(() => {
        showLobbyScreen();
    }, 200);
}

function showLobbyScreen() {
    const overlay = document.createElement('div');
    overlay.className = 'lobby-screen active';
    overlay.id = 'lobbyScreen';
    overlay.innerHTML = `
        <div class="lobby-close" onclick="closeLobby()">✕</div>
        <div class="lobby-timer" id="lobbyTimer">00:30</div>
        <div class="lobby-status">Jangchilar yig'ilmoqda: <span id="lobbyCount">1</span>/50</div>
        <div class="avatar-cloud" id="avatarCloud"></div>
    `;
    document.body.appendChild(overlay);
    
    // Start timer
    startLobbyTimer();
    
    // Add floating avatars
    addFloatingAvatars();
}

function closeLobby() {
    Haptic.light();
    const lobby = document.getElementById('lobbyScreen');
    if (lobby) {
        lobby.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => lobby.remove(), 300);
    }
}

let lobbyTimer = 30;
function startLobbyTimer() {
    const timerEl = document.getElementById('lobbyTimer');
    const interval = setInterval(() => {
        lobbyTimer--;
        if (lobbyTimer <= 0) {
            clearInterval(interval);
            startBattle();
            return;
        }
        const mins = Math.floor(lobbyTimer / 60);
        const secs = lobbyTimer % 60;
        timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

function addFloatingAvatars() {
    const cloud = document.getElementById('avatarCloud');
    const emojis = ['👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🦸', '🧙', '🥷'];
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const avatar = document.createElement('div');
            avatar.className = 'floating-avatar';
            avatar.textContent = emojis[i % emojis.length];
            avatar.style.left = `${10 + Math.random() * 80}%`;
            avatar.style.top = `${10 + Math.random() * 80}%`;
            avatar.style.animationDelay = `${Math.random() * 2}s`;
            cloud.appendChild(avatar);
            
            // Update count
            const countEl = document.getElementById('lobbyCount');
            if (countEl) {
                countEl.textContent = parseInt(countEl.textContent) + 1;
            }
            
            Haptic.light();
        }, i * 500);
    }
}

function startBattle() {
    Haptic.heavy();
    closeLobby();
    
    // Warp effect then show arena
    setTimeout(() => {
        showArena();
    }, 500);
}

// ═══════════ ARENA (QUIZ INTERFACE) ═══════════
let currentQuestion = 0;
let score = 0;
let combo = 0;
let questionTimer = null;
let timeLeft = 15;

const demoQuestions = [
    {
        question: "Python'da list va tuple farqi nima?",
        answers: ["List o'zgaruvchan", "Tuple tezroq", "Ikkalasi bir xil", "Farqi yo'q"],
        correct: 0
    },
    {
        question: "HTTP va HTTPS farqi?",
        answers: ["Tezlik", "Xavfsizlik", "Port", "Protokol"],
        correct: 1
    },
    {
        question: "SQL Injection nima?",
        answers: ["Ma'lumot qo'shish", "Xavfsizlik hujumi", "Query optimizatsiya", "Index yaratish"],
        correct: 1
    }
];

function showArena() {
    currentQuestion = 0;
    score = 0;
    combo = 0;
    
    const overlay = document.createElement('div');
    overlay.className = 'arena-screen active';
    overlay.id = 'arenaScreen';
    overlay.innerHTML = `
        <div class="arena-header">
            <span id="questionNum">1/${demoQuestions.length}</span>
            <div class="arena-progress">
                <div class="arena-progress-bar" id="arenaProgress" style="width: 0%"></div>
            </div>
            <span id="scoreDisplay">0</span>
        </div>
        <div class="question-card">
            <div class="timer-bar" id="timerBar" style="width: 100%"></div>
            <div class="question-number">Savol <span id="qNum">1</span></div>
            <div class="question-text" id="questionText"></div>
        </div>
        <div class="answers-grid" id="answersGrid"></div>
    `;
    document.body.appendChild(overlay);
    
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= demoQuestions.length) {
        endQuiz();
        return;
    }
    
    const q = demoQuestions[currentQuestion];
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('qNum').textContent = currentQuestion + 1;
    document.getElementById('questionNum').textContent = `${currentQuestion + 1}/${demoQuestions.length}`;
    
    const grid = document.getElementById('answersGrid');
    grid.innerHTML = q.answers.map((ans, i) => `
        <div class="answer-btn" onclick="selectAnswer(${i})">${ans}</div>
    `).join('');
    
    // Start timer
    timeLeft = 15;
    startQuestionTimer();
}

function startQuestionTimer() {
    const timerBar = document.getElementById('timerBar');
    timerBar.style.width = '100%';
    timerBar.className = 'timer-bar';
    
    questionTimer = setInterval(() => {
        timeLeft -= 0.1;
        const percent = (timeLeft / 15) * 100;
        timerBar.style.width = `${percent}%`;
        
        if (percent < 30) {
            timerBar.className = 'timer-bar danger';
        } else if (percent < 60) {
            timerBar.className = 'timer-bar warning';
        }
        
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            selectAnswer(-1); // Time out
        }
    }, 100);
}

function selectAnswer(index) {
    clearInterval(questionTimer);
    
    const q = demoQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach((btn, i) => {
        btn.style.pointerEvents = 'none';
        if (i === q.correct) {
            btn.classList.add('correct');
        } else if (i === index && index !== q.correct) {
            btn.classList.add('wrong');
        }
    });
    
    if (index === q.correct) {
        // Correct answer
        score += 100 + (combo * 10);
        combo++;
        Haptic.success();
        
        if (combo > 1) {
            showCombo(combo);
        }
    } else {
        // Wrong answer
        combo = 0;
        Haptic.error();
    }
    
    document.getElementById('scoreDisplay').textContent = score;
    
    // Update progress
    const progress = ((currentQuestion + 1) / demoQuestions.length) * 100;
    document.getElementById('arenaProgress').style.width = `${progress}%`;
    
    // Next question
    setTimeout(() => {
        currentQuestion++;
        loadQuestion();
    }, 1500);
}

function showCombo(num) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup show';
    popup.textContent = `🔥 COMBO x${num}!`;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

function endQuiz() {
    const arena = document.getElementById('arenaScreen');
    if (arena) arena.remove();
    
    showVictoryScreen();
}

// ═══════════ VICTORY SCREEN ═══════════
function showVictoryScreen() {
    const isWin = score > 150;
    const xpEarned = Math.floor(score * 0.5);
    
    Haptic.success();
    
    const overlay = document.createElement('div');
    overlay.className = `victory-screen active ${isWin ? 'win' : 'lose'}`;
    overlay.id = 'victoryScreen';
    overlay.innerHTML = `
        <div class="victory-trophy">${isWin ? '🏆' : '💔'}</div>
        <div class="victory-title">${isWin ? "G'ALABA!" : 'Keyingi safar!'}</div>
        <div class="victory-subtitle">${isWin ? 'Ajoyib natija!' : 'Qayta urinib ko\'ring'}</div>
        
        <div class="victory-stats">
            <div class="stat-row">
                <span class="stat-label">To'g'ri javoblar</span>
                <span class="stat-value">${Math.floor(score / 100)}/${demoQuestions.length}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Maksimal combo</span>
                <span class="stat-value">x${combo}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Umumiy ball</span>
                <span class="stat-value">${score}</span>
            </div>
        </div>
        
        <div class="xp-earned">
            <div class="xp-earned-value" id="xpEarnedValue">+0</div>
            <div class="xp-earned-label">XP qo'shildi</div>
        </div>
        
        <div class="victory-actions">
            <button class="victory-btn btn-secondary" onclick="closeVictory()">Chiqish</button>
            <button class="victory-btn btn-primary" onclick="restartQuiz()">Qayta o'ynash</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Animate XP counter
    animateXP(xpEarned);
    
    // Send result to bot
    sendData({
        action: 'quiz_complete',
        score: score,
        total: demoQuestions.length,
        xp_earned: xpEarned
    });
}

function animateXP(target) {
    const el = document.getElementById('xpEarnedValue');
    let current = 0;
    const step = Math.ceil(target / 30);
    
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = `+${current}`;
        Haptic.light();
    }, 50);
}

function closeVictory() {
    Haptic.light();
    const victory = document.getElementById('victoryScreen');
    if (victory) victory.remove();
}

function restartQuiz() {
    Haptic.medium();
    closeVictory();
    setTimeout(() => showArena(), 300);
}

// ═══════════ DUEL MODE ═══════════
function startDuel() {
    Haptic.heavy();
    
    // Sword clash sound effect (visual)
    const card = event.currentTarget;
    card.style.animation = 'shake 0.3s ease';
    
    sendData({ action: 'start_duel' });
    
    // Show searching overlay
    showSearchingOverlay();
}

function showSearchingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'lobby-screen active';
    overlay.id = 'searchingOverlay';
    overlay.innerHTML = `
        <div class="lobby-close" onclick="closeSearching()">✕</div>
        <div style="font-size: 60px; margin-bottom: 20px;">🔍</div>
        <div class="lobby-timer" style="font-size: 24px;">Raqib qidirilmoqda...</div>
        <div class="radar-animation"></div>
    `;
    document.body.appendChild(overlay);
    
    // Simulate finding opponent
    setTimeout(() => {
        closeSearching();
        showArena(); // Start duel quiz
    }, 3000);
}

function closeSearching() {
    const overlay = document.getElementById('searchingOverlay');
    if (overlay) overlay.remove();
}

// ═══════════ SHOP ═══════════
function openShop() {
    Haptic.success();
    
    const overlay = document.createElement('div');
    overlay.className = 'shop-overlay active';
    overlay.id = 'shopOverlay';
    overlay.innerHTML = `
        <div class="shop-header">
            <div class="shop-title">💰 Oltin Do'koni</div>
            <div class="shop-balance">
                <span>🪙</span>
                <span class="shop-balance-value">${formatNumber(userData?.gold || 0)}</span>
            </div>
            <div class="shop-close" onclick="closeShop()">✕</div>
        </div>
        <div class="shop-content">
            <div class="shop-grid">
                ${getShopItems().map(item => `
                    <div class="shop-item" onclick="buyItem('${item.id}', ${item.price})">
                        <div class="shop-item-icon">${item.icon}</div>
                        <div class="shop-item-spotlight"></div>
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-desc">${item.desc}</div>
                        <div class="shop-item-price ${(userData?.gold || 0) < item.price ? 'insufficient' : ''}">
                            🪙 ${item.price}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function getShopItems() {
    return [
        { id: 'hint', icon: '💡', name: 'Hint', desc: 'Bitta javobni olib tashlash', price: 50 },
        { id: 'fifty', icon: '🎯', name: '50/50', desc: 'Ikkita noto\'g\'ri javobni olib tashlash', price: 100 },
        { id: 'freeze', icon: '❄️', name: 'Streak Freeze', desc: 'Streakni bir kun saqlash', price: 200 },
        { id: 'xp_boost', icon: '⚡', name: 'XP Boost', desc: '2x XP 1 soat davomida', price: 500 },
        { id: 'theme', icon: '🎨', name: 'Neon Theme', desc: 'Maxsus interfeys rangi', price: 1000 },
        { id: 'badge', icon: '🏅', name: 'VIP Badge', desc: 'Profilga maxsus badge', price: 2000 }
    ];
}

function buyItem(itemId, price) {
    if ((userData?.gold || 0) < price) {
        Haptic.error();
        showToast('Yetarli oltin yo\'q!', 'error');
        return;
    }
    
    Haptic.success();
    userData.gold -= price;
    
    // Update balance display
    document.querySelector('.shop-balance-value').textContent = formatNumber(userData.gold);
    
    sendData({ action: 'shop_purchase', item_id: itemId, price: price });
    
    showToast(`${itemId} sotib olindi!`, 'success');
}

function closeShop() {
    Haptic.light();
    const shop = document.getElementById('shopOverlay');
    if (shop) {
        shop.style.animation = 'slide-down 0.3s ease forwards';
        setTimeout(() => shop.remove(), 300);
    }
}

// ═══════════ PROFILE ═══════════
function openProfile() {
    Haptic.light();
    switchTab('game'); // Temporary - will show full profile
}

// ═══════════ STUDY TOOLS ═══════════
function openPDFQuiz() {
    Haptic.medium();
    sendData({ action: 'open_pdf_quiz' });
    showToast('PDF yuklash oynasi ochilmoqda...', 'info');
}

function openMindMap() {
    Haptic.medium();
    sendData({ action: 'open_mindmap' });
    showToast('MindMap tez orada!', 'info');
}

function openFlashcards() {
    Haptic.medium();
    sendData({ action: 'open_flashcards' });
    showToast('Flashcards tez orada!', 'info');
}

function openNotes() {
    Haptic.medium();
    sendData({ action: 'open_notes' });
    showToast('Eslatmalar tez orada!', 'info');
}

// ═══════════ STREAK INFO ═══════════
function showStreakInfo() {
    Haptic.light();
    showToast(`🔥 ${userData?.streak || 0} kunlik streak! Davom eting!`, 'info');
}

// ═══════════ UTILITIES ═══════════
function createRipple(e, color) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        top: ${e.clientY}px;
        left: ${e.clientX}px;
        width: 10px;
        height: 10px;
        background: ${color};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        animation: ripple-expand 0.6s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function createParticleExplosion(e) {
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        const angle = (i / 12) * Math.PI * 2;
        particle.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            width: 8px;
            height: 8px;
            background: var(--neon-purple);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: particle-fly 0.5s ease-out forwards;
            --tx: ${Math.cos(angle) * 100}px;
            --ty: ${Math.sin(angle) * 100}px;
        `;
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        success: 'var(--neon-green)',
        error: 'var(--neon-red)',
        info: 'var(--neon-cyan)'
    };
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid ${colors[type]};
        color: ${colors[type]};
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 10000;
        animation: toast-in 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function showSecurityAlert() {
    Haptic.error();
    showToast('⚠️ Xavfsizlik ogohlantirishi!', 'error');
}

function showOverlay(type) {
    // Placeholder for different overlay types
    console.log('Opening overlay:', type);
}

// ═══════════ SEND DATA TO BOT ═══════════
function sendData(data) {
    if (tg) {
        tg.sendData(JSON.stringify(data));
    } else {
        console.log('Would send to bot:', data);
    }
}

// ═══════════ CSS ANIMATIONS (injected) ═══════════
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-expand {
        to { width: 300px; height: 300px; opacity: 0; }
    }
    @keyframes particle-fly {
        to { transform: translate(var(--tx), var(--ty)); opacity: 0; }
    }
    @keyframes toast-in {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toast-out {
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    @keyframes fadeOut {
        to { opacity: 0; }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
    @keyframes slide-down {
        to { transform: translateY(100%); }
    }
    
    .lobby-screen {
        display: none;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: var(--void);
        z-index: 2000;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .lobby-screen.active { display: flex; animation: fadeIn 0.3s ease; }
    .lobby-close { position: absolute; top: 20px; right: 20px; font-size: 24px; color: var(--text-muted); cursor: pointer; }
    .lobby-timer { font-size: 72px; font-weight: 800; color: transparent; -webkit-text-stroke: 2px var(--neon-green); text-shadow: 0 0 30px var(--neon-green); margin-bottom: 20px; font-family: 'Courier New', monospace; }
    .lobby-status { font-size: 16px; color: var(--text-secondary); margin-bottom: 40px; }
    .lobby-status span { color: var(--neon-green); font-weight: 700; }
    .avatar-cloud { position: relative; width: 100%; height: 200px; }
    .floating-avatar { position: absolute; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--neon-purple), var(--neon-blue)); display: flex; align-items: center; justify-content: center; font-size: 16px; animation: avatar-float 4s ease-in-out infinite; border: 2px solid rgba(255, 255, 255, 0.2); }
    @keyframes avatar-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    
    .arena-screen { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--void); z-index: 2000; flex-direction: column; padding: 20px; }
    .arena-screen.active { display: flex; animation: fadeIn 0.3s ease; }
    .arena-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 14px; color: var(--text-secondary); }
    .arena-progress { flex: 1; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; margin: 0 16px; overflow: hidden; }
    .arena-progress-bar { height: 100%; background: linear-gradient(90deg, var(--neon-green), var(--neon-cyan)); transition: width 0.3s ease; }
    .question-card { background: rgba(20, 20, 30, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden; }
    .timer-bar { position: absolute; top: 0; left: 0; height: 4px; background: var(--neon-green); border-radius: 24px 24px 0 0; transition: width 0.1s linear, background 0.3s ease; }
    .timer-bar.warning { background: var(--neon-gold); }
    .timer-bar.danger { background: var(--neon-red); }
    .question-number { font-size: 12px; color: var(--neon-cyan); margin-bottom: 12px; }
    .question-text { font-size: 18px; font-weight: 600; line-height: 1.5; }
    .answers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1; align-content: start; }
    .answer-btn { background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; font-size: 15px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; text-align: center; }
    .answer-btn:active { transform: scale(0.98); }
    .answer-btn.correct { background: rgba(0, 255, 163, 0.3); border-color: var(--neon-green); box-shadow: 0 0 20px rgba(0, 255, 163, 0.3); }
    .answer-btn.wrong { background: rgba(255, 51, 102, 0.3); border-color: var(--neon-red); animation: shake 0.5s ease; }
    .combo-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); font-size: 32px; font-weight: 800; color: var(--neon-gold); text-shadow: 0 0 20px var(--neon-gold); z-index: 3000; pointer-events: none; }
    .combo-popup.show { animation: combo-pop 0.8s ease-out forwards; }
    @keyframes combo-pop { 0% { transform: translate(-50%, -50%) scale(0); opacity: 0; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 100% { transform: translate(-50%, -80%) scale(1); opacity: 0; } }
    
    .victory-screen { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2000; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
    .victory-screen.active { display: flex; }
    .victory-screen.win { background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, var(--void) 70%); }
    .victory-screen.lose { background: radial-gradient(circle at center, rgba(100, 100, 150, 0.1) 0%, var(--void) 70%); }
    .victory-trophy { font-size: 100px; margin-bottom: 20px; animation: trophy-drop 0.8s ease-out; }
    @keyframes trophy-drop { 0% { transform: translateY(-100px) scale(0); opacity: 0; } 60% { transform: translateY(20px) scale(1.1); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
    .victory-title { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    .victory-screen.win .victory-title { color: var(--neon-gold); text-shadow: 0 0 20px var(--neon-gold); }
    .victory-screen.lose .victory-title { color: var(--text-muted); }
    .victory-subtitle { font-size: 16px; color: var(--text-secondary); margin-bottom: 40px; }
    .victory-stats { width: 100%; max-width: 300px; }
    .stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .stat-label { color: var(--text-secondary); }
    .stat-value { font-weight: 700; }
    .xp-earned { margin-top: 30px; text-align: center; }
    .xp-earned-value { font-size: 48px; font-weight: 800; color: var(--neon-green); font-family: 'Courier New', monospace; }
    .xp-earned-label { font-size: 14px; color: var(--text-secondary); }
    .victory-actions { display: flex; gap: 12px; margin-top: 40px; }
    .victory-btn { padding: 14px 28px; border-radius: 25px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s ease; border: none; }
    .victory-btn:active { transform: scale(0.95); }
    .btn-primary { background: linear-gradient(135deg, var(--neon-green), var(--neon-cyan)); color: var(--void); }
    .btn-secondary { background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); }
    
    .shop-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 3000; flex-direction: column; }
    .shop-overlay.active { display: flex; animation: slide-up 0.3s ease-out; }
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .shop-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .shop-title { font-size: 24px; font-weight: 800; display: flex; align-items: center; gap: 12px; }
    .shop-balance { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.1)); padding: 8px 16px; border-radius: 20px; border: 1px solid var(--neon-gold); }
    .shop-balance-value { font-size: 18px; font-weight: 700; color: var(--neon-gold); }
    .shop-close { font-size: 28px; color: var(--text-muted); cursor: pointer; }
    .shop-content { flex: 1; overflow-y: auto; padding: 20px; }
    .shop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .shop-item { background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 20px; padding: 20px; text-align: center; cursor: pointer; transition: transform 0.2s ease; position: relative; overflow: hidden; }
    .shop-item:active { transform: scale(0.95); }
    .shop-item-icon { font-size: 48px; margin-bottom: 12px; animation: item-levitate 3s ease-in-out infinite; }
    @keyframes item-levitate { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .shop-item-spotlight { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60%; height: 20px; background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%); }
    .shop-item-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .shop-item-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 12px; }
    .shop-item-price { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.1)); padding: 6px 14px; border-radius: 15px; font-size: 14px; font-weight: 700; color: var(--neon-gold); }
    .shop-item-price.insufficient { color: var(--neon-red); opacity: 0.6; }
`;
document.head.appendChild(style);
