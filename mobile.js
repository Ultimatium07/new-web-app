/**
 * NEXUS QUANTUM APEX - Mobile Optimization
 * Touch gestures, haptic feedback, mobile features
 */

class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = 'ontouchstart' in window;
        this.gestures = {};
        this.touchStart = null;
        this.swipeThreshold = 50;
        this.longPressThreshold = 500;
        this.longPressTimer = null;
        
        this.init();
    }
    
    init() {
        if (this.isMobile) {
            this.setupMobileUI();
            this.setupTouchGestures();
            this.setupHapticFeedback();
            this.setupMobileFeatures();
            this.optimizePerformance();
        }
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // ==================== MOBILE UI SETUP ====================
    
    setupMobileUI() {
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Adjust viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Make buttons larger for touch
        document.querySelectorAll('button, .btn, .clickable').forEach(el => {
            el.style.minHeight = '44px';
            el.style.minWidth = '44px';
        });
        
        // Add mobile-specific styles
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            .mobile-device {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            .mobile-device input, .mobile-device textarea {
                -webkit-user-select: auto;
                user-select: auto;
            }
            
            .mobile-device .scrollable {
                -webkit-overflow-scrolling: touch;
                overflow-scrolling: touch;
            }
            
            .mobile-device .quantum-button {
                padding: 12px 24px;
                font-size: 16px;
            }
            
            .mobile-device .nav-item {
                padding: 16px;
                font-size: 14px;
            }
            
            /* Prevent zoom on double tap */
            .mobile-device * {
                touch-action: manipulation;
            }
            
            /* Safe area insets for notched phones */
            .mobile-device .header {
                padding-top: env(safe-area-inset-top);
            }
            
            .mobile-device .bottom-nav {
                padding-bottom: env(safe-area-inset-bottom);
            }
        `;
        document.head.appendChild(mobileStyles);
    }
    
    // ==================== TOUCH GESTURES ====================
    
    setupTouchGestures() {
        // Swipe gestures
        this.setupSwipeGestures();
        
        // Long press
        this.setupLongPress();
        
        // Pinch to zoom (for specific elements)
        this.setupPinchZoom();
        
        // Pull to refresh
        this.setupPullToRefresh();
    }
    
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        
        // Horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.swipeThreshold) {
            if (diffX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        }
        
        // Vertical swipe
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > this.swipeThreshold) {
            if (diffY > 0) {
                this.onSwipeDown();
            } else {
                this.onSwipeUp();
            }
        }
    }
    
    onSwipeLeft() {
        // Navigate to next section
        const sections = ['mining', 'quiz', 'battle', 'wayground', 'files', 'profile'];
        const current = window.NexusApp?.currentSection || 'mining';
        const currentIndex = sections.indexOf(current);
        
        if (currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];
            if (window.switchSection) {
                window.switchSection(nextSection);
            }
        }
    }
    
    onSwipeRight() {
        // Navigate to previous section
        const sections = ['mining', 'quiz', 'battle', 'wayground', 'files', 'profile'];
        const current = window.NexusApp?.currentSection || 'mining';
        const currentIndex = sections.indexOf(current);
        
        if (currentIndex > 0) {
            const prevSection = sections[currentIndex - 1];
            if (window.switchSection) {
                window.switchSection(prevSection);
            }
        }
    }
    
    onSwipeUp() {
        // Could be used for opening details or expanding
    }
    
    onSwipeDown() {
        // Could be used for closing or refreshing
    }
    
    setupLongPress() {
        document.addEventListener('touchstart', (e) => {
            this.longPressTimer = setTimeout(() => {
                this.onLongPress(e);
            }, this.longPressThreshold);
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(this.longPressTimer);
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(this.longPressTimer);
        });
    }
    
    onLongPress(e) {
        // Show context menu or special action
        const target = e.target;
        
        if (target.classList.contains('long-pressable')) {
            // Custom long press action
            if (target.dataset.action) {
                this.executeLongPressAction(target.dataset.action, target);
            }
        }
    }
    
    executeLongPressAction(action, element) {
        switch (action) {
            case 'show-stats':
                // Show detailed stats
                break;
            case 'share':
                // Share functionality
                if (navigator.share) {
                    navigator.share({
                        title: 'NEXUS QUANTUM APEX',
                        text: 'Check out this amazing app!',
                        url: window.location.href
                    });
                }
                break;
        }
    }
    
    setupPinchZoom() {
        let initialDistance = 0;
        let scale = 1;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                scale = currentDistance / initialDistance;
                
                // Apply zoom to zoomable elements
                const zoomable = e.target.closest('.zoomable');
                if (zoomable) {
                    zoomable.style.transform = `scale(${scale})`;
                }
            }
        });
    }
    
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    setupPullToRefresh() {
        let startY = 0;
        let pulling = false;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!pulling) return;
            
            const currentY = e.touches[0].pageY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 0) {
                e.preventDefault();
                
                // Show pull indicator
                const indicator = document.getElementById('pullToRefresh');
                if (indicator) {
                    indicator.style.transform = `translateY(${Math.min(pullDistance, 100)}px)`;
                    indicator.style.opacity = Math.min(pullDistance / 100, 1);
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!pulling) return;
            pulling = false;
            
            const currentY = e.changedTouches[0].pageY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 100) {
                // Trigger refresh
                this.refreshContent();
            }
            
            // Hide indicator
            const indicator = document.getElementById('pullToRefresh');
            if (indicator) {
                indicator.style.transform = 'translateY(0)';
                indicator.style.opacity = '0';
            }
        });
    }
    
    refreshContent() {
        // Refresh content
        if (window.NexusApp) {
            window.NexusApp.syncWithBot();
            showToast('Content refreshed!', 'success');
        }
    }
    
    // ==================== HAPTIC FEEDBACK ====================
    
    setupHapticFeedback() {
        // Check for haptic support
        this.hapticSupported = 'vibrate' in navigator || 'hapticFeedback' in window.Telegram?.WebApp;
        
        // Add haptic to buttons
        document.querySelectorAll('.quantum-button, .btn').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                this.triggerHaptic('light');
            });
        });
    }
    
    triggerHaptic(type = 'light') {
        if (!this.hapticSupported) return;
        
        // Telegram WebApp haptic
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
                case 'success':
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                    break;
                case 'warning':
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                    break;
                case 'error':
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                    break;
            }
        }
        // Native vibration
        else if (navigator.vibrate) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30, 10, 30],
                success: [10, 30, 10, 30],
                warning: [50, 50, 50],
                error: [100, 50, 100]
            };
            
            navigator.vibrate(patterns[type] || [10]);
        }
    }
    
    // ==================== MOBILE FEATURES ====================
    
    setupMobileFeatures() {
        // Camera access
        this.setupCameraAccess();
        
        // File upload optimization
        this.setupFileUpload();
        
        // Offline support
        this.setupOfflineSupport();
        
        // Share API
        this.setupShareAPI();
        
        // Install prompt
        this.setupInstallPrompt();
    }
    
    setupCameraAccess() {
        // Add camera button to file upload
        const cameraBtn = document.getElementById('cameraBtn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                this.openCamera();
            });
        }
    }
    
    openCamera() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && window.FileUploadSystem) {
                window.FileUploadSystem.processFile(file);
            }
        };
        
        input.click();
    }
    
    setupFileUpload() {
        // Optimize for mobile file upload
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.setAttribute('accept', 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt');
            fileInput.setAttribute('multiple', 'true');
        }
    }
    
    setupOfflineSupport() {
        // Service worker registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered');
            }).catch(error => {
                console.log('SW registration failed');
            });
        }
        
        // Online/offline detection
        window.addEventListener('online', () => {
            showToast('Back online!', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            showToast('Offline mode', 'warning');
        });
    }
    
    syncOfflineData() {
        // Sync any offline data when back online
        const offlineData = localStorage.getItem('nexus_offline_data');
        if (offlineData && window.NexusApp) {
            try {
                const data = JSON.parse(offlineData);
                // Process offline data
                localStorage.removeItem('nexus_offline_data');
            } catch (e) {
                console.error('Failed to sync offline data:', e);
            }
        }
    }
    
    setupShareAPI() {
        // Add share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.shareContent({
                    title: 'NEXUS QUANTUM APEX',
                    text: 'Check out this amazing quantum-powered app!',
                    url: window.location.href
                });
            });
        });
    }
    
    shareContent(data) {
        if (navigator.share) {
            navigator.share(data).catch(err => {
                console.log('Share failed:', err);
            });
        } else {
            // Fallback - copy to clipboard
            this.copyToClipboard(data.url || window.location.href);
            showToast('Link copied to clipboard!', 'success');
        }
    }
    
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            const installBtn = document.getElementById('installBtn');
            if (installBtn) {
                installBtn.style.display = 'block';
                installBtn.addEventListener('click', () => {
                    this.installApp(deferredPrompt);
                });
            }
        });
    }
    
    installApp(prompt) {
        prompt.prompt();
        prompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast('App installed!', 'success');
            }
        });
    }
    
    // ==================== PERFORMANCE OPTIMIZATION ====================
    
    optimizePerformance() {
        // Lazy loading
        this.setupLazyLoading();
        
        // Image optimization
        this.optimizeImages();
        
        // Reduce motion for battery
        this.setupBatteryOptimization();
        
        // Memory management
        this.setupMemoryManagement();
    }
    
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    optimizeImages() {
        // Use WebP if supported
        const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        if (supportsWebP) {
            document.querySelectorAll('img[data-webp]').forEach(img => {
                img.src = img.dataset.webp;
            });
        }
    }
    
    setupBatteryOptimization() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const updatePerformance = () => {
                    if (battery.level < 0.2) {
                        // Reduce animations on low battery
                        document.body.classList.add('low-battery');
                    } else {
                        document.body.classList.remove('low-battery');
                    }
                };
                
                updatePerformance();
                battery.addEventListener('levelchange', updatePerformance);
            });
        }
    }
    
    setupMemoryManagement() {
        // Clean up event listeners on page unload
        window.addEventListener('beforeunload', () => {
            // Clear timers
            clearTimeout(this.longPressTimer);
            
            // Remove event listeners
            document.removeEventListener('touchstart', this.touchStartHandler);
            document.removeEventListener('touchmove', this.touchMoveHandler);
            document.removeEventListener('touchend', this.touchEndHandler);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimizer = new MobileOptimizer();
});

// Export for use in other modules
window.MobileOptimizer = MobileOptimizer;
