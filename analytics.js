/**
 * NEXUS QUANTUM APEX - Analytics System
 * User tracking, metrics, insights, business intelligence
 */

class AnalyticsEngine {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.events = [];
        this.metrics = {
            session: {
                startTime: Date.now(),
                duration: 0,
                pageViews: 0,
                interactions: 0
            },
            user: {
                totalSessions: 0,
                totalDuration: 0,
                lastActive: null,
                features: {},
                achievements: [],
                level: 1,
                xp: 0,
                gold: 0
            },
            features: {
                mining: { uses: 0, totalTaps: 0, avgSessionTime: 0 },
                quiz: { uses: 0, completed: 0, avgScore: 0, perfectScores: 0 },
                battle: { uses: 0, wins: 0, losses: 0, winRate: 0 },
                fileUpload: { uses: 0, filesAnalyzed: 0, avgFileSize: 0 },
                social: { shares: 0, invites: 0, friends: 0 }
            },
            performance: {
                loadTime: 0,
                errorCount: 0,
                crashCount: 0,
                memoryUsage: 0
            },
            business: {
                retention: { d1: false, d7: false, d30: false },
                conversion: { freeToPremium: false, premiumDate: null },
                revenue: { total: 0, monthly: 0, sources: {} }
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadStoredData();
        this.setupEventTracking();
        this.setupPerformanceMonitoring();
        this.setupUserBehaviorTracking();
        this.startSessionTracking();
        this.setupErrorTracking();
    }
    
    // ==================== SESSION MANAGEMENT ====================
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    }
    
    startSessionTracking() {
        // Track session start
        this.trackEvent('session_start', {
            timestamp: Date.now(),
            source: this.getTrafficSource(),
            device: this.getDeviceInfo(),
            browser: this.getBrowserInfo()
        });
        
        // Update session metrics
        this.metrics.session.startTime = Date.now();
        this.metrics.user.totalSessions++;
        this.metrics.user.lastActive = Date.now();
        
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        });
        
        // Track session end
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }
    
    pauseSession() {
        this.metrics.session.pausedAt = Date.now();
    }
    
    resumeSession() {
        if (this.metrics.session.pausedAt) {
            const pauseDuration = Date.now() - this.metrics.session.pausedAt;
            this.metrics.session.startTime += pauseDuration;
            delete this.metrics.session.pausedAt;
        }
    }
    
    endSession() {
        const duration = Date.now() - this.metrics.session.startTime;
        this.metrics.session.duration = duration;
        this.metrics.user.totalDuration += duration;
        
        this.trackEvent('session_end', {
            duration: duration,
            pageViews: this.metrics.session.pageViews,
            interactions: this.metrics.session.interactions
        });
        
        this.saveData();
        this.sendBatch();
    }
    
    // ==================== EVENT TRACKING ====================
    
    setupEventTracking() {
        // Track all clicks
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });
        
        // Track feature usage
        this.trackFeatureUsage();
        
        // Track navigation
        this.trackNavigation();
    }
    
    trackClick(e) {
        const target = e.target;
        const element = this.getElementInfo(target);
        
        this.metrics.session.interactions++;
        
        this.trackEvent('click', {
            element: element,
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });
    }
    
    getElementInfo(element) {
        return {
            tag: element.tagName,
            id: element.id,
            class: element.className,
            text: element.textContent?.substring(0, 50),
            href: element.href,
            dataset: { ...element.dataset }
        };
    }
    
    trackFeatureUsage() {
        // Mining
        if (window.NexusApp) {
            const originalAddXP = window.NexusApp.addXP || (() => {});
            window.NexusApp.addXP = (amount, source) => {
                this.metrics.features.mining.uses++;
                this.metrics.features.mining.totalTaps++;
                originalAddXP(amount, source);
                this.trackEvent('feature_use', { feature: 'mining', amount: amount });
            };
        }
        
        // Quiz
        if (window.QuizSystem) {
            const originalStartQuiz = window.QuizSystem.startQuiz || (() => {});
            window.QuizSystem.startQuiz = (topic) => {
                this.metrics.features.quiz.uses++;
                originalStartQuiz(topic);
                this.trackEvent('feature_use', { feature: 'quiz', topic: topic });
            };
        }
        
        // Battle
        if (window.BattleSystem) {
            const originalStartBattle = window.BattleSystem.startBattle || (() => {});
            window.BattleSystem.startBattle = () => {
                this.metrics.features.battle.uses++;
                originalStartBattle();
                this.trackEvent('feature_use', { feature: 'battle' });
            };
        }
        
        // File Upload
        if (window.FileUploadSystem) {
            const originalHandleFiles = window.FileUploadSystem.handleFiles || (() => {});
            window.FileUploadSystem.handleFiles = (files) => {
                this.metrics.features.fileUpload.uses++;
                this.metrics.features.fileUpload.filesAnalyzed += files.length;
                originalHandleFiles(files);
                this.trackEvent('feature_use', { 
                    feature: 'file_upload', 
                    fileCount: files.length 
                });
            };
        }
    }
    
    trackNavigation() {
        const sections = ['mining', 'quiz', 'battle', 'wayground', 'files', 'profile'];
        
        sections.forEach(section => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.target.id === `${section}Section` && 
                        mutation.target.classList.contains('active')) {
                        this.trackEvent('navigation', { 
                            section: section,
                            timestamp: Date.now()
                        });
                        this.metrics.session.pageViews++;
                    }
                });
            });
            
            const sectionEl = document.getElementById(`${section}Section`);
            if (sectionEl) {
                observer.observe(sectionEl, { 
                    attributes: true, 
                    attributeFilter: ['class'] 
                });
            }
        });
    }
    
    // ==================== USER BEHAVIOR TRACKING ====================
    
    setupUserBehaviorTracking() {
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track time on page
        this.trackTimeOnPage();
        
        // Track form interactions
        this.trackFormInteractions();
        
        // Track error interactions
        this.trackErrorInteractions();
    }
    
    trackScrollDepth() {
        let maxScroll = 0;
        let scrollMarks = [25, 50, 75, 90];
        let achievedMarks = [];
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            maxScroll = Math.max(maxScroll, scrollPercent);
            
            scrollMarks.forEach(mark => {
                if (scrollPercent >= mark && !achievedMarks.includes(mark)) {
                    achievedMarks.push(mark);
                    this.trackEvent('scroll_depth', { 
                        depth: mark,
                        timestamp: Date.now()
                    });
                }
            });
        });
    }
    
    trackTimeOnPage() {
        const startTime = Date.now();
        let lastActive = startTime;
        
        // Track activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                lastActive = Date.now();
            });
        });
        
        // Check for idle time
        setInterval(() => {
            const idleTime = Date.now() - lastActive;
            if (idleTime > 30000) { // 30 seconds idle
                this.trackEvent('idle_start', { 
                    idleTime: idleTime,
                    timestamp: Date.now()
                });
            }
        }, 10000);
    }
    
    trackFormInteractions() {
        document.querySelectorAll('form').forEach(form => {
            let interactions = 0;
            let startTime = null;
            
            form.addEventListener('focusin', () => {
                if (!startTime) startTime = Date.now();
                interactions++;
            });
            
            form.addEventListener('submit', () => {
                this.trackEvent('form_submit', {
                    formId: form.id,
                    interactions: interactions,
                    timeSpent: Date.now() - startTime
                });
            });
        });
    }
    
    trackErrorInteractions() {
        window.addEventListener('error', (e) => {
            this.metrics.performance.errorCount++;
            this.trackEvent('error', {
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                column: e.colno,
                stack: e.error?.stack
            });
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('unhandled_rejection', {
                reason: e.reason
            });
        });
    }
    
    // ==================== PERFORMANCE MONITORING ====================
    
    setupPerformanceMonitoring() {
        // Track page load time
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                this.metrics.performance.loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                this.trackEvent('performance', {
                    loadTime: this.metrics.performance.loadTime,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
                });
            }, 0);
        });
        
        // Track memory usage
        if (performance.memory) {
            setInterval(() => {
                this.metrics.performance.memoryUsage = performance.memory.usedJSHeapSize;
                
                this.trackEvent('memory_usage', {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                });
            }, 30000); // Every 30 seconds
        }
        
        // Track long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        this.trackEvent('long_task', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
    }
    
    // ==================== ERROR TRACKING ====================
    
    setupErrorTracking() {
        // Already handled in user behavior tracking
        // Add custom error tracking here
    }
    
    // ==================== DATA MANAGEMENT ====================
    
    trackEvent(eventName, data = {}) {
        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId
        };
        
        this.events.push(event);
        
        // Send immediately for critical events
        if (this.isCriticalEvent(eventName)) {
            this.sendEvent(event);
        }
        
        // Batch send for non-critical events
        if (this.events.length >= 10) {
            this.sendBatch();
        }
    }
    
    isCriticalEvent(eventName) {
        const criticalEvents = [
            'session_start',
            'session_end',
            'error',
            'purchase',
            'level_up',
            'achievement_unlocked'
        ];
        
        return criticalEvents.includes(eventName);
    }
    
    sendEvent(event) {
        fetch('/api/analytics/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).catch(err => {
            console.error('Failed to send analytics event:', err);
        });
    }
    
    sendBatch() {
        if (this.events.length === 0) return;
        
        const batch = [...this.events];
        this.events = [];
        
        fetch('/api/analytics/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                events: batch,
                metrics: this.metrics
            })
        }).catch(err => {
            console.error('Failed to send analytics batch:', err);
            // Restore events on failure
            this.events = [...batch, ...this.events];
        });
    }
    
    // ==================== RETENTION TRACKING ====================
    
    trackRetention() {
        const now = Date.now();
        const firstVisit = localStorage.getItem('nexus_first_visit');
        
        if (!firstVisit) {
            localStorage.setItem('nexus_first_visit', now);
            return;
        }
        
        const daysSinceFirstVisit = Math.floor((now - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceFirstVisit === 1) {
            this.metrics.business.retention.d1 = true;
            this.trackEvent('retention_milestone', { day: 1 });
        }
        
        if (daysSinceFirstVisit === 7) {
            this.metrics.business.retention.d7 = true;
            this.trackEvent('retention_milestone', { day: 7 });
        }
        
        if (daysSinceFirstVisit === 30) {
            this.metrics.business.retention.d30 = true;
            this.trackEvent('retention_milestone', { day: 30 });
        }
    }
    
    // ==================== CONVERSION TRACKING ====================
    
    trackConversion(type, value = 0) {
        this.trackEvent('conversion', {
            type: type,
            value: value,
            timestamp: Date.now()
        });
        
        if (type === 'premium_purchase') {
            this.metrics.business.conversion.freeToPremium = true;
            this.metrics.business.conversion.premiumDate = Date.now();
            this.metrics.business.revenue.total += value;
        }
    }
    
    // ==================== UTILITY METHODS ====================
    
    getTrafficSource() {
        const referrer = document.referrer;
        const utmSource = new URLSearchParams(window.location.search).get('utm_source');
        
        if (utmSource) return utmSource;
        if (referrer.includes('google')) return 'google';
        if (referrer.includes('facebook')) return 'facebook';
        if (referrer.includes('twitter')) return 'twitter';
        if (referrer.includes('telegram')) return 'telegram';
        
        return 'direct';
    }
    
    getDeviceInfo() {
        return {
            type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            os: this.getOperatingSystem(),
            screen: {
                width: screen.width,
                height: screen.height
            }
        };
    }
    
    getOperatingSystem() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown';
    }
    
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
    
    // ==================== DATA STORAGE ====================
    
    saveData() {
        const data = {
            metrics: this.metrics,
            lastSaved: Date.now()
        };
        
        localStorage.setItem('nexus_analytics', JSON.stringify(data));
    }
    
    loadStoredData() {
        const stored = localStorage.getItem('nexus_analytics');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.metrics = { ...this.metrics, ...data.metrics };
            } catch (e) {
                console.error('Failed to load analytics data:', e);
            }
        }
    }
    
    // ==================== PUBLIC API ====================
    
    setUser(userId) {
        this.userId = userId;
        this.trackEvent('user_identified', { userId: userId });
    }
    
    trackCustomEvent(name, data) {
        this.trackEvent(name, data);
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
    
    getReport() {
        return {
            session: {
                duration: this.metrics.session.duration,
                pageViews: this.metrics.session.pageViews,
                interactions: this.metrics.session.interactions
            },
            user: {
                totalSessions: this.metrics.user.totalSessions,
                avgSessionDuration: this.metrics.user.totalDuration / this.metrics.user.totalSessions,
                currentLevel: this.metrics.user.level,
                currentXP: this.metrics.user.xp,
                currentGold: this.metrics.user.gold
            },
            features: this.metrics.features,
            performance: this.metrics.performance,
            business: this.metrics.business
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsEngine();
    
    // Set user ID when available
    if (window.NexusApp && window.NexusApp.user.telegramId) {
        window.analytics.setUser(window.NexusApp.user.telegramId);
    }
    
    // Track retention
    window.analytics.trackRetention();
});

// Export for use in other modules
window.AnalyticsEngine = AnalyticsEngine;
