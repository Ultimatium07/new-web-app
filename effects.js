/**
 * NEXUS QUANTUM APEX - Visual Effects Engine
 * Quantum particles, neon glow, holographic UI
 */

class QuantumEffects {
    constructor() {
        this.particles = [];
        this.animations = [];
        this.canvas = null;
        this.ctx = null;
        this.neuralNetwork = null;
        this.quantumField = null;
        this.init();
    }
    
    init() {
        this.setupCanvases();
        this.createParticles();
        this.startAnimations();
        this.initEventListeners();
    }
    
    setupCanvases() {
        // Quantum Background Canvas
        this.canvas = document.getElementById('quantumBg');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
        
        // Neural Network Canvas
        this.neuralCanvas = document.getElementById('neuralBg');
        if (this.neuralCanvas) {
            this.neuralCtx = this.neuralCanvas.getContext('2d');
            this.resizeNeuralCanvas();
            window.addEventListener('resize', () => this.resizeNeuralCanvas());
        }
        
        // Particle Canvas
        this.particleCanvas = document.getElementById('particleCanvas');
        if (this.particleCanvas) {
            this.particleCtx = this.particleCanvas.getContext('2d');
            this.resizeParticleCanvas();
            window.addEventListener('resize', () => this.resizeParticleCanvas());
        }
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    resizeNeuralCanvas() {
        if (!this.neuralCanvas) return;
        this.neuralCanvas.width = window.innerWidth;
        this.neuralCanvas.height = window.innerHeight;
    }
    
    resizeParticleCanvas() {
        if (!this.particleCanvas) return;
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }
    
    createParticles() {
        // Create quantum particles
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                color: ['#00ffff', '#ff00ff', '#8b5cf6', '#ffd700'][Math.floor(Math.random() * 4)],
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.03
            });
        }
    }
    
    startAnimations() {
        // Quantum field animation
        this.animateQuantumField();
        
        // Neural network animation
        this.animateNeuralNetwork();
        
        // Particle animation
        this.animateParticles();
        
        // Holographic scan lines
        this.startScanLines();
        
        // Data stream effect
        this.startDataStream();
    }
    
    animateQuantumField() {
        if (!this.ctx || !this.canvas) return;
        
        const draw = () => {
            // Clear with fade effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw quantum grid
            const time = Date.now() * 0.0001;
            const gridSize = 50;
            
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            
            // Vertical lines with wave effect
            for (let x = 0; x < this.canvas.width; x += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                
                for (let y = 0; y < this.canvas.height; y += 10) {
                    const offset = Math.sin(time + y * 0.01) * 5;
                    this.ctx.lineTo(x + offset, y);
                }
                
                this.ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                
                for (let x = 0; x < this.canvas.width; x += 10) {
                    const offset = Math.sin(time + x * 0.01) * 5;
                    this.ctx.lineTo(x, y + offset);
                }
                
                this.ctx.stroke();
            }
            
            // Draw quantum nodes
            for (let i = 0; i < 5; i++) {
                const x = (this.canvas.width / 6) * (i + 1);
                const y = this.canvas.height / 2 + Math.sin(time + i) * 100;
                const size = 10 + Math.sin(time * 2 + i) * 5;
                
                // Glow effect
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
                gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
                gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
                
                // Core
                this.ctx.fillStyle = '#00ffff';
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }
    
    animateNeuralNetwork() {
        if (!this.neuralCtx || !this.neuralCanvas) return;
        
        const nodes = [];
        const nodeCount = 20;
        
        // Create neural nodes
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * this.neuralCanvas.width,
                y: Math.random() * this.neuralCanvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                connections: []
            });
        }
        
        const draw = () => {
            this.neuralCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.neuralCtx.fillRect(0, 0, this.neuralCanvas.width, this.neuralCanvas.height);
            
            // Update nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                
                // Bounce off walls
                if (node.x < 0 || node.x > this.neuralCanvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > this.neuralCanvas.height) node.vy *= -1;
                
                // Keep in bounds
                node.x = Math.max(0, Math.min(this.neuralCanvas.width, node.x));
                node.y = Math.max(0, Math.min(this.neuralCanvas.height, node.y));
            });
            
            // Draw connections
            nodes.forEach((node1, i) => {
                nodes.slice(i + 1).forEach(node2 => {
                    const dx = node1.x - node2.x;
                    const dy = node1.y - node2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 200) {
                        const opacity = (1 - distance / 200) * 0.5;
                        this.neuralCtx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        this.neuralCtx.lineWidth = 1;
                        this.neuralCtx.beginPath();
                        this.neuralCtx.moveTo(node1.x, node1.y);
                        this.neuralCtx.lineTo(node2.x, node2.y);
                        this.neuralCtx.stroke();
                    }
                });
            });
            
            // Draw nodes
            nodes.forEach(node => {
                // Glow
                const gradient = this.neuralCtx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, 10
                );
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
                
                this.neuralCtx.fillStyle = gradient;
                this.neuralCtx.fillRect(node.x - 10, node.y - 10, 20, 20);
                
                // Core
                this.neuralCtx.fillStyle = '#8b5cf6';
                this.neuralCtx.beginPath();
                this.neuralCtx.arc(node.x, node.y, 3, 0, Math.PI * 2);
                this.neuralCtx.fill();
            });
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }
    
    animateParticles() {
        if (!this.particleCtx || !this.particleCanvas) return;
        
        const draw = () => {
            this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            
            this.particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.pulse += particle.pulseSpeed;
                
                // Wrap around
                if (particle.x < 0) particle.x = this.particleCanvas.width;
                if (particle.x > this.particleCanvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.particleCanvas.height;
                if (particle.y > this.particleCanvas.height) particle.y = 0;
                
                // Calculate pulse size
                const pulseFactor = 1 + Math.sin(particle.pulse) * 0.3;
                const size = particle.size * pulseFactor;
                
                // Draw particle with glow
                const gradient = this.particleCtx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, size * 3
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(0.3, particle.color + '80');
                gradient.addColorStop(1, particle.color + '00');
                
                this.particleCtx.fillStyle = gradient;
                this.particleCtx.fillRect(
                    particle.x - size * 3,
                    particle.y - size * 3,
                    size * 6,
                    size * 6
                );
                
                // Draw core
                this.particleCtx.fillStyle = particle.color;
                this.particleCtx.beginPath();
                this.particleCtx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                this.particleCtx.fill();
            });
            
            // Connect nearby particles
            this.particles.forEach((p1, i) => {
                this.particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        const opacity = (1 - distance / 150) * 0.3;
                        this.particleCtx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                        this.particleCtx.lineWidth = 0.5;
                        this.particleCtx.beginPath();
                        this.particleCtx.moveTo(p1.x, p1.y);
                        this.particleCtx.lineTo(p2.x, p2.y);
                        this.particleCtx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }
    
    startScanLines() {
        const scanContainer = document.createElement('div');
        scanContainer.className = 'scan-lines';
        scanContainer.innerHTML = '<div class="scan-line"></div>';
        document.body.appendChild(scanContainer);
        
        // Add scan line styles
        const style = document.createElement('style');
        style.textContent = `
            .scan-lines {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                overflow: hidden;
            }
            
            .scan-line {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(0, 255, 255, 0.5) 50%, 
                    transparent 100%);
                animation: scan-move 4s linear infinite;
            }
            
            @keyframes scan-move {
                0% { transform: translateY(0); }
                100% { transform: translateY(100vh); }
            }
        `;
        document.head.appendChild(style);
    }
    
    startDataStream() {
        const streamContainer = document.createElement('div');
        streamContainer.className = 'data-stream';
        document.body.appendChild(streamContainer);
        
        // Create data stream elements
        for (let i = 0; i < 20; i++) {
            const stream = document.createElement('div');
            stream.className = 'data-stream-item';
            stream.textContent = this.generateRandomCode();
            stream.style.left = Math.random() * 100 + '%';
            stream.style.animationDelay = Math.random() * 5 + 's';
            stream.style.animationDuration = (5 + Math.random() * 5) + 's';
            streamContainer.appendChild(stream);
        }
        
        // Add data stream styles
        const style = document.createElement('style');
        style.textContent = `
            .data-stream {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                overflow: hidden;
            }
            
            .data-stream-item {
                position: absolute;
                top: -20px;
                color: rgba(0, 255, 255, 0.3);
                font-family: 'Courier New', monospace;
                font-size: 12px;
                animation: data-stream-fall linear infinite;
            }
            
            @keyframes data-stream-fall {
                0% {
                    transform: translateY(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    generateRandomCode() {
        const chars = '01';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
    
    // Interactive effects
    createClickEffect(x, y, color = '#00ffff') {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            border: 2px solid ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: click-ripple 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 600);
        
        // Add animation if not exists
        if (!document.querySelector('#click-effect-style')) {
            const style = document.createElement('style');
            style.id = 'click-effect-style';
            style.textContent = `
                @keyframes click-ripple {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createExplosion(x, y, particleCount = 30) {
        const colors = ['#00ffff', '#ff00ff', '#8b5cf6', '#ffd700'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 / particleCount) * i;
            const velocity = 100 + Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.className = 'explosion-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 6px ${color};
                --tx: ${Math.cos(angle) * velocity}px;
                --ty: ${Math.sin(angle) * velocity}px;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
        
        // Add explosion animation
        if (!document.querySelector('#explosion-style')) {
            const style = document.createElement('style');
            style.id = 'explosion-style';
            style.textContent = `
                .explosion-particle {
                    animation: explode 1s ease-out forwards;
                }
                
                @keyframes explode {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createFloatingText(text, x, y, color = '#00ffff') {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            font-weight: 700;
            text-shadow: 0 0 10px ${color};
            pointer-events: none;
            z-index: 9999;
            animation: float-up 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => floatingText.remove(), 1500);
        
        // Add animation if not exists
        if (!document.querySelector('#floating-text-style')) {
            const style = document.createElement('style');
            style.id = 'floating-text-style';
            style.textContent = `
                @keyframes float-up {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -200%) scale(1.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initEventListeners() {
        // Add click effects to interactive elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quantum-button, .clickable')) {
                this.createClickEffect(e.clientX, e.clientY);
            }
        });
        
        // Add hover effects
        document.querySelectorAll('.quantum-button').forEach(btn => {
            btn.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 20px var(--quantum-cyan)';
            });
            
            btn.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
            });
        });
    }
}

// Initialize effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.quantumEffects = new QuantumEffects();
});

// Export for use in other modules
window.QuantumEffects = QuantumEffects;
