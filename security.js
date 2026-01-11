/**
 * NEXUS QUANTUM APEX - Security System
 * Rate limiting, anti-cheat, validation, encryption
 */

class SecuritySystem {
    constructor() {
        this.rateLimits = new Map();
        this.antiCheatData = new Map();
        this.encryptionKey = this.generateEncryptionKey();
        this.sessionToken = null;
        this.userId = null;
        
        this.init();
    }
    
    init() {
        this.generateSessionToken();
        this.setupRateLimiting();
        this.setupAntiCheat();
        this.setupInputValidation();
        this.setupCSRFProtection();
        this.setupContentSecurityPolicy();
    }
    
    // ==================== SESSION MANAGEMENT ====================
    
    generateSessionToken() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        this.sessionToken = btoa(`${timestamp}:${random}`);
        sessionStorage.setItem('nexus_session', this.sessionToken);
    }
    
    validateSession() {
        const stored = sessionStorage.getItem('nexus_session');
        if (!stored || stored !== this.sessionToken) {
            this.handleSessionInvalid();
            return false;
        }
        return true;
    }
    
    handleSessionInvalid() {
        // Clear sensitive data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login or show error
        alert('Session expired. Please refresh the page.');
        window.location.reload();
    }
    
    // ==================== RATE LIMITING ====================
    
    setupRateLimiting() {
        // Rate limits per endpoint
        this.limits = {
            'mining': { max: 30, window: 60000 },    // 30 taps per minute
            'quiz': { max: 10, window: 60000 },      // 10 quizzes per minute
            'battle': { max: 5, window: 60000 },      // 5 battles per minute
            'file_upload': { max: 10, window: 60000 }, // 10 files per minute
            'api_call': { max: 100, window: 60000 }   // 100 API calls per minute
        };
    }
    
    checkRateLimit(action) {
        const now = Date.now();
        const key = `${this.userId || 'anonymous'}_${action}`;
        
        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, { count: 0, resetTime: now + this.limits[action].window });
        }
        
        const limit = this.rateLimits.get(key);
        
        // Reset if window expired
        if (now > limit.resetTime) {
            limit.count = 0;
            limit.resetTime = now + this.limits[action].window;
        }
        
        // Check limit
        if (limit.count >= this.limits[action].max) {
            const waitTime = Math.ceil((limit.resetTime - now) / 1000);
            throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
        }
        
        limit.count++;
        return true;
    }
    
    // ==================== ANTI-CHEAT SYSTEM ====================
    
    setupAntiCheat() {
        this.cheatDetection = {
            impossibleSpeed: false,
            modifiedClient: false,
            autoClicker: false,
            timeManipulation: false
        };
        
        // Start monitoring
        this.startCheatMonitoring();
    }
    
    startCheatMonitoring() {
        // Monitor for impossible click speeds
        this.monitorClickSpeed();
        
        // Monitor for time manipulation
        this.monitorTimeManipulation();
        
        // Monitor for client modifications
        this.monitorClientIntegrity();
    }
    
    monitorClickSpeed() {
        let clickCount = 0;
        let lastClickTime = Date.now();
        
        document.addEventListener('click', () => {
            const now = Date.now();
            const timeDiff = now - lastClickTime;
            
            // More than 10 clicks per second is suspicious
            if (timeDiff < 100) {
                clickCount++;
                if (clickCount > 50) {
                    this.cheatDetection.autoClicker = true;
                    this.handleCheatDetection('auto_clicker');
                }
            } else {
                clickCount = Math.max(0, clickCount - 1);
            }
            
            lastClickTime = now;
        });
    }
    
    monitorTimeManipulation() {
        let lastServerTime = Date.now();
        let lastClientTime = Date.now();
        
        setInterval(() => {
            const now = Date.now();
            const clientDiff = now - lastClientTime;
            const expectedServerDiff = now - lastServerTime;
            
            // If client time is significantly different from expected
            if (Math.abs(clientDiff - expectedServerDiff) > 5000) {
                this.cheatDetection.timeManipulation = true;
                this.handleCheatDetection('time_manipulation');
            }
            
            lastServerTime = now;
            lastClientTime = now;
        }, 10000);
    }
    
    monitorClientIntegrity() {
        // Check for suspicious modifications
        const checkIntegrity = () => {
            // Check if critical functions are modified
            if (window.NexusApp && typeof window.NexusApp.addXP !== 'function') {
                this.cheatDetection.modifiedClient = true;
                this.handleCheatDetection('modified_client');
            }
            
            // Check for debugger
            if (window.debugger || window.devtools) {
                this.logSecurityEvent('debugger_detected');
            }
        };
        
        setInterval(checkIntegrity, 30000);
    }
    
    handleCheatDetection(type) {
        // Log the cheat attempt
        this.logSecurityEvent(`cheat_detected_${type}`);
        
        // Apply penalties
        switch (type) {
            case 'auto_clicker':
                // Temporarily disable mining
                if (window.NexusApp) {
                    window.NexusApp.user.energy = 0;
                    window.updateUI();
                }
                showToast('⚠️ Suspicious activity detected. Mining temporarily disabled.', 'error');
                break;
                
            case 'time_manipulation':
                // Reset user progress
                if (window.NexusApp) {
                    window.NexusApp.user.xp = Math.floor(window.NexusApp.user.xp * 0.5);
                    window.updateUI();
                }
                showToast('⚠️ Time manipulation detected. Progress reduced.', 'error');
                break;
                
            case 'modified_client':
                // Lock account temporarily
                this.lockAccount('suspicious_activity');
                break;
        }
    }
    
    // ==================== INPUT VALIDATION ====================
    
    setupInputValidation() {
        // Sanitize all user inputs
        this.setupInputSanitization();
        
        // Validate file uploads
        this.setupFileValidation();
        
        // Validate API calls
        this.setupAPIValidation();
    }
    
    setupInputSanitization() {
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Remove potentially dangerous characters
                const value = e.target.value;
                const sanitized = this.sanitizeInput(value);
                
                if (value !== sanitized) {
                    e.target.value = sanitized;
                    this.logSecurityEvent('input_sanitized');
                }
            }
        });
    }
    
    sanitizeInput(input) {
        // Remove XSS attempts
        const sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        
        return sanitized;
    }
    
    setupFileValidation() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                
                files.forEach(file => {
                    if (!this.validateFile(file)) {
                        e.target.value = '';
                        showToast('Invalid file type or size', 'error');
                        this.logSecurityEvent(`invalid_file_${file.name}`);
                    }
                });
            });
        }
    }
    
    validateFile(file) {
        // Allowed file types
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'audio/mpeg', 'audio/wav', 'audio/m4a',
            'video/mp4', 'video/webm',
            'application/pdf', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        // Max file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        
        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }
    
    setupAPIValidation() {
        // Intercept fetch calls to validate
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const [url, options] = args;
            
            // Validate URL
            if (!this.validateURL(url)) {
                throw new Error('Invalid API URL');
            }
            
            // Add security headers
            if (!options.headers) {
                options.headers = {};
            }
            
            options.headers['X-Session-Token'] = this.sessionToken;
            options.headers['X-Client-Timestamp'] = Date.now();
            
            return originalFetch(...args);
        };
    }
    
    validateURL(url) {
        try {
            const parsed = new URL(url);
            
            // Only allow same origin or whitelisted domains
            const allowedDomains = [
                window.location.hostname,
                'api.telegram.org',
                'api.openai.com',
                'vercel.app'
            ];
            
            return allowedDomains.includes(parsed.hostname);
        } catch {
            return false;
        }
    }
    
    // ==================== CSRF PROTECTION ====================
    
    setupCSRFProtection() {
        this.csrfToken = this.generateCSRFToken();
        
        // Add token to all forms
        document.querySelectorAll('form').forEach(form => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = this.csrfToken;
            form.appendChild(input);
        });
    }
    
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    validateCSRFToken(token) {
        return token === this.csrfToken;
    }
    
    // ==================== ENCRYPTION ====================
    
    generateEncryptionKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return array;
    }
    
    async encrypt(data) {
        try {
            const encoded = new TextEncoder().encode(JSON.stringify(data));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                await this.getCryptoKey(),
                encoded
            );
            
            return {
                encrypted: Array.from(new Uint8Array(encrypted)),
                iv: Array.from(iv)
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            return null;
        }
    }
    
    async decrypt(encryptedData) {
        try {
            const key = await this.getCryptoKey();
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
                key,
                new Uint8Array(encryptedData.encrypted)
            );
            
            return JSON.parse(new TextDecoder().decode(decrypted));
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }
    
    async getCryptoKey() {
        if (!this.cryptoKey) {
            this.cryptoKey = await crypto.subtle.importKey(
                'raw',
                this.encryptionKey,
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
        }
        return this.cryptoKey;
    }
    
    // ==================== CONTENT SECURITY POLICY ====================
    
    setupContentSecurityPolicy() {
        // CSP is set via HTTP headers, but we can add inline script nonce
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (!script.nonce) {
                script.nonce = this.generateNonce();
            }
        });
    }
    
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }
    
    // ==================== ACCOUNT SECURITY ====================
    
    lockAccount(reason) {
        const lockData = {
            reason: reason,
            timestamp: Date.now(),
            duration: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        localStorage.setItem('nexus_account_lock', JSON.stringify(lockData));
        
        // Show lock message
        showModal('🔒 Account Locked', `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: var(--quantum-red); margin-bottom: 20px;">Account Temporarily Locked</h3>
                <p>Your account has been locked due to suspicious activity.</p>
                <p>Please contact support or wait 24 hours.</p>
                <p>Reason: ${reason}</p>
            </div>
        `);
    }
    
    isAccountLocked() {
        const lockData = localStorage.getItem('nexus_account_lock');
        if (!lockData) return false;
        
        try {
            const lock = JSON.parse(lockData);
            const now = Date.now();
            
            if (now - lock.timestamp > lock.duration) {
                // Lock expired
                localStorage.removeItem('nexus_account_lock');
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    }
    
    // ==================== LOGGING ====================
    
    logSecurityEvent(event) {
        const logEntry = {
            event: event,
            timestamp: Date.now(),
            userId: this.userId,
            userAgent: navigator.userAgent,
            ip: null // Would be filled by server
        };
        
        // Store locally
        const logs = JSON.parse(localStorage.getItem('nexus_security_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 entries
        if (logs.length > 100) {
            logs.shift();
        }
        
        localStorage.setItem('nexus_security_logs', JSON.stringify(logs));
        
        // Send to server if available
        this.sendSecurityLog(logEntry);
    }
    
    sendSecurityLog(logEntry) {
        // Send to server for analysis
        fetch('/api/security/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': this.sessionToken
            },
            body: JSON.stringify(logEntry)
        }).catch(err => {
            console.error('Failed to send security log:', err);
        });
    }
    
    // ==================== PUBLIC API ====================
    
    validateAction(action, data) {
        // Check rate limit
        this.checkRateLimit(action);
        
        // Check session
        if (!this.validateSession()) {
            throw new Error('Invalid session');
        }
        
        // Check account lock
        if (this.isAccountLocked()) {
            throw new Error('Account is locked');
        }
        
        // Validate data
        this.validateData(data);
        
        return true;
    }
    
    validateData(data) {
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data format');
        }
        
        // Check for suspicious patterns
        const dataString = JSON.stringify(data);
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /data:text\/html/i
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(dataString)) {
                throw new Error('Suspicious data detected');
            }
        }
    }
    
    // Initialize user ID
    setUserId(userId) {
        this.userId = userId;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.security = new SecuritySystem();
    
    // Set user ID when available
    if (window.NexusApp && window.NexusApp.user.telegramId) {
        window.security.setUserId(window.NexusApp.user.telegramId);
    }
});

// Export for use in other modules
window.SecuritySystem = SecuritySystem;
