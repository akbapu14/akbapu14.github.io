// Main JavaScript for Jarvis-themed interface

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loading screen
    initLoadingScreen();
    
    // Initialize cursor
    initCustomCursor();
    
    // Initialize Three.js background
    initHolographicBackground();
    
    // Initialize clock and date
    initClockAndDate();
    
    // Initialize terminal
    initTerminal();
    
    // Initialize system stats
    initSystemStats();
    
    // Initialize audio visualizer
    initAudioVisualizer();
});

// Loading Screen Animation
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingPercentage = document.querySelector('.loading-percentage');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 1;
        if (progress > 100) progress = 100;
        
        loadingPercentage.textContent = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
    }, 100);
}

// Custom Cursor
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorCircle = document.querySelector('.cursor-circle');
    const cursorDot = document.querySelector('.cursor-dot');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.display = 'block';
        
        // Add a slight delay for the circle for a trailing effect
        setTimeout(() => {
            cursorCircle.style.top = `${e.clientY}px`;
            cursorCircle.style.left = `${e.clientX}px`;
        }, 50);
        
        // The dot follows the cursor exactly
        cursorDot.style.top = `${e.clientY}px`;
        cursorDot.style.left = `${e.clientX}px`;
    });
    
    document.addEventListener('mouseout', () => {
        cursor.style.display = 'none';
    });
    
    // Change cursor appearance when hovering over links
    const links = document.querySelectorAll('a, button, .project-card, .skill-tag');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorCircle.style.width = '50px';
            cursorCircle.style.height = '50px';
            cursorCircle.style.border = '1px solid rgba(255, 126, 0, 0.5)';
            cursorDot.style.width = '8px';
            cursorDot.style.height = '8px';
            cursorDot.style.backgroundColor = 'var(--secondary-color)';
        });
        
        link.addEventListener('mouseleave', () => {
            cursorCircle.style.width = '40px';
            cursorCircle.style.height = '40px';
            cursorCircle.style.border = '1px solid rgba(10, 170, 255, 0.5)';
            cursorDot.style.width = '6px';
            cursorDot.style.height = '6px';
            cursorDot.style.backgroundColor = 'var(--primary-color)';
        });
    });
}

// Holographic Background with Three.js
function initHolographicBackground() {
    const canvas = document.getElementById('holographic-background');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Create grid lines
    const gridSize = 50;
    const gridDivisions = 20;
    const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0x0a7dff,
        transparent: true,
        opacity: 0.2
    });
    
    // Horizontal grid lines
    for (let i = -gridSize/2; i <= gridSize/2; i += gridSize/gridDivisions) {
        const points = [];
        points.push(new THREE.Vector3(-gridSize/2, i, 0));
        points.push(new THREE.Vector3(gridSize/2, i, 0));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        scene.add(line);
    }
    
    // Vertical grid lines
    for (let i = -gridSize/2; i <= gridSize/2; i += gridSize/gridDivisions) {
        const points = [];
        points.push(new THREE.Vector3(i, -gridSize/2, 0));
        points.push(new THREE.Vector3(i, gridSize/2, 0));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        scene.add(line);
    }
    
    // Add floating particles
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        
        sizes[i] = Math.random() * 2;
    }
    
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x0af,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        size: 0.5
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Add a subtle glow effect
    const glowGeometry = new THREE.SphereGeometry(20, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            uniform float time;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                vec3 color = vec3(0.0, 0.5, 1.0) * intensity;
                gl_FragColor = vec4(color, intensity * 0.3);
            }
        `,
        transparent: true,
        side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Mouse movement effect
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation loop
    const clock = new THREE.Clock();
    
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        
        // Update particles
        particles.rotation.x = elapsedTime * 0.05;
        particles.rotation.y = elapsedTime * 0.03;
        
        // Update glow
        glowMaterial.uniforms.time.value = elapsedTime;
        
        // Smooth camera movement following mouse
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        // Render
        renderer.render(scene, camera);
        
        // Call animate again on the next frame
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Particle System for Hero Section
function initParticleSystem() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const particleContainer = document.getElementById('particles');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particleContainer.appendChild(canvas);
    
    const particles = [];
    const particleCount = 100;
    const maxDistance = 150;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            color: 'rgba(10, 170, 255, ' + (Math.random() * 0.5 + 0.25) + ')',
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1
        });
    }
    
    // Animation function
    function animate() {
        requestAnimationFrame(animate);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // Move particles
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Bounce off edges
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Connect particles with lines
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                
                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(10, 170, 255, ' + (1 - distance / maxDistance) * 0.2 + ')';
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    animate();
}

// Typing Effect
function initTypingEffect() {
    const typingText = document.querySelector('.typing-text');
    const text = typingText.textContent;
    typingText.textContent = '';
    
    let i = 0;
    const typingSpeed = 50; // ms per character
    
    function typeWriter() {
        if (i < text.length) {
            typingText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, typingSpeed);
        }
    }
    
    // Start typing after loading screen completes
    setTimeout(typeWriter, 2500);
}

// Dynamic Subtitle
function initDynamicSubtitle() {
    const subtitles = [
        "INNOVATOR • DEVELOPER • VISIONARY",
        "BUILDING THE FUTURE, ONE LINE AT A TIME",
        "TURNING COMPLEX PROBLEMS INTO ELEGANT SOLUTIONS",
        "WHERE CREATIVITY MEETS TECHNICAL EXCELLENCE"
    ];
    
    const subtitleElement = document.getElementById('dynamic-subtitle');
    let currentIndex = 0;
    
    function updateSubtitle() {
        // Fade out
        subtitleElement.style.opacity = '0';
        
        setTimeout(() => {
            // Update text
            subtitleElement.textContent = subtitles[currentIndex];
            
            // Fade in
            subtitleElement.style.opacity = '1';
            
            // Update index
            currentIndex = (currentIndex + 1) % subtitles.length;
        }, 500);
    }
    
    // Initial subtitle
    subtitleElement.textContent = subtitles[0];
    subtitleElement.style.opacity = '1';
    
    // Change subtitle every 5 seconds
    setInterval(updateSubtitle, 5000);
}

// Initialize animations for skills and stats
function initAnimations() {
    // Animate skill bars on scroll
    const skillBars = document.querySelectorAll('.skill-progress');
    const statCircles = document.querySelectorAll('.stat-circle-progress');
    
    // Intersection Observer for skill bars
    const observerOptions = {
        threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('skill-progress')) {
                    entry.target.style.width = entry.target.style.width || entry.target.getAttribute('style').split('width:')[1].trim();
                } else if (entry.target.classList.contains('stat-circle-progress')) {
                    // The stroke-dashoffset is already set in CSS
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all skill bars and stat circles
    skillBars.forEach(bar => {
        observer.observe(bar);
    });
    
    statCircles.forEach(circle => {
        observer.observe(circle);
    });
}
