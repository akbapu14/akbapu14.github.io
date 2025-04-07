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
    
    // Initialize chat interface
    initChatInterface();
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
    const links = document.querySelectorAll('a, button, .header-item');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorCircle.style.width = '50px';
            cursorCircle.style.height = '50px';
            cursorCircle.style.border = '1px solid rgba(0, 255, 255, 0.8)';
            cursorDot.style.width = '8px';
            cursorDot.style.height = '8px';
        });
        
        link.addEventListener('mouseleave', () => {
            cursorCircle.style.width = '40px';
            cursorCircle.style.height = '40px';
            cursorCircle.style.border = '1px solid rgba(0, 255, 255, 0.5)';
            cursorDot.style.width = '6px';
            cursorDot.style.height = '6px';
        });
    });
}

// Neural Network with Cityscape Background
function initHolographicBackground() {
    const canvas = document.getElementById('holographic-background');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050A14, 1); // Dark blue background
    
    const scene = new THREE.Scene();
    const fog = new THREE.FogExp2(0x050A14, 0.035);
    scene.fog = fog;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);
    camera.lookAt(0, 0, 0);
    
    // Neural Network Nodes and Connections
    const nodes = [];
    const connections = [];
    const nodeCount = 120;
    const nodeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    
    // Blue-toned materials for nodes
    const nodeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00BFFF, // Deep sky blue
        transparent: true, 
        opacity: 0.4 
    });
    
    // Connection material
    const connectionMaterial = new THREE.LineBasicMaterial({
        color: 0x00BFFF,
        transparent: true,
        opacity: 0.15
    });
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(
            nodeGeometry,
            nodeMaterial.clone()
        );
        
        // Position in 3D space
        node.position.x = (Math.random() - 0.5) * 30;
        node.position.y = (Math.random() - 0.5) * 20;
        node.position.z = (Math.random() - 0.5) * 30;
        
        // Add data for animation
        node.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.005, // Significantly slower movement
                (Math.random() - 0.5) * 0.005,
                (Math.random() - 0.5) * 0.005
            ),
            energyLevel: Math.random(),
            energyChangeSpeed: Math.random() * 0.01 + 0.005
        };
        
        scene.add(node);
        nodes.push(node);
    }
    
    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
        const sourceNode = nodes[i];
        
        // Connect to a few nearby nodes
        for (let j = 0; j < nodes.length; j++) {
            if (i !== j) {
                const targetNode = nodes[j];
                const distance = sourceNode.position.distanceTo(targetNode.position);
                
                // Connect if nearby (with some randomness)
                if (distance < 7 && Math.random() < 0.2) {
                    const points = [];
                    points.push(sourceNode.position);
                    points.push(targetNode.position);
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, connectionMaterial.clone());
                    
                    line.userData = {
                        source: sourceNode,
                        target: targetNode,
                        active: false,
                        progress: 0
                    };
                    
                    scene.add(line);
                    connections.push(line);
                }
            }
        }
    }
    
    // Create cityscape in the background
    createCityscape(scene);
    
    // Initialize current flow between nodes
    connections.forEach(connection => {
        connection.userData.currentFlow = Math.random();
        connection.userData.flowSpeed = Math.random() * 0.005 + 0.003; // Slower flow speed
        connection.userData.flowDirection = Math.random() > 0.5 ? 1 : -1;
        
        // Add synapse particle system to each connection
        createSynapseParticles(connection);
    });
    
    // Function to create synapse particle effect along connections
    function createSynapseParticles(connection) {
        const particleCount = 5 + Math.floor(Math.random() * 5);
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Create a small particle that will travel along the connection
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 4, 4),
                new THREE.MeshBasicMaterial({
                    color: 0x00FFFF,
                    transparent: true,
                    opacity: 0.7
                })
            );
            
            // Starting position is somewhere on the connection line
            const progress = Math.random();
            particle.userData = {
                progress: progress,
                speed: 0.1 + Math.random() * 0.2,
                active: false,
                activationDelay: Math.random() * 5 // Random delay before becoming active
            };
            
            // Add to scene but make initially invisible
            particle.visible = false;
            scene.add(particle);
            particles.push(particle);
        }
        
        // Store particles with the connection
        connection.userData.synapseParticles = particles;
    }
    
    // Animation clock
    const clock = new THREE.Clock();
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();
        
        // Animate camera
        camera.position.x = Math.sin(time * 0.1) * 5;
        camera.position.y = 5 + Math.sin(time * 0.08) * 2;
        camera.lookAt(0, 0, 0);
        
        // Update nodes
        nodes.forEach(node => {
            // Move nodes very subtly
            node.position.add(node.userData.velocity);
            
            // Boundary check and bounce
            if (Math.abs(node.position.x) > 15) node.userData.velocity.x *= -1;
            if (Math.abs(node.position.y) > 10) node.userData.velocity.y *= -1;
            if (Math.abs(node.position.z) > 15) node.userData.velocity.z *= -1;
            
            // Subtle energy pulse
            node.userData.energyLevel += node.userData.energyChangeSpeed;
            if (node.userData.energyLevel > 1 || node.userData.energyLevel < 0) {
                node.userData.energyChangeSpeed *= -1;
            }
            
            // Very subtle opacity changes
            node.material.opacity = 0.3 + node.userData.energyLevel * 0.2;
        });
        
        // Update connections
        connections.forEach(conn => {
            // Update line geometry to follow moving nodes
            const points = [];
            points.push(conn.userData.source.position.clone());
            points.push(conn.userData.target.position.clone());
            conn.geometry.setFromPoints(points);
            
            // Animate flowing current
            conn.userData.currentFlow += conn.userData.flowSpeed * conn.userData.flowDirection;
            if (conn.userData.currentFlow > 1 || conn.userData.currentFlow < 0) {
                conn.userData.flowDirection *= -1;
                
                // When flow reverses, activate a new set of particles
                if (Math.random() > 0.3) {
                    activateSynapseParticles(conn);
                }
            }
            
            // Create flowing energy effect on connection
            const flow = conn.userData.currentFlow;
            conn.material.opacity = 0.1 + flow * 0.3;
            conn.material.color.setRGB(0, 0.75 + flow * 0.25, 1);
            
            // When current reaches peak, slightly energize connected nodes
            if (flow > 0.95 || flow < 0.05) {
                const targetNode = conn.userData.flowDirection > 0 ? conn.userData.target : conn.userData.source;
                if (targetNode.userData.energyChangeSpeed < 0) {
                    targetNode.userData.energyChangeSpeed *= -1;
                }
            }
            
            // Update synapse particles
            if (conn.userData.synapseParticles) {
                updateSynapseParticles(conn, delta);
            }
        });
        
        renderer.render(scene, camera);
    }
    
    // Function to activate synapse particles along a connection
    function activateSynapseParticles(connection) {
        // Get source and target positions
        const sourcePos = connection.userData.source.position;
        const targetPos = connection.userData.target.position;
        
        // Determine flow direction
        const flowingToTarget = connection.userData.flowDirection > 0;
        const startPos = flowingToTarget ? sourcePos : targetPos;
        const endPos = flowingToTarget ? targetPos : sourcePos;
        
        // Activate a random number of particles
        const particles = connection.userData.synapseParticles;
        const particlesToActivate = 1 + Math.floor(Math.random() * 3);
        
        let activatedCount = 0;
        particles.forEach(particle => {
            if (!particle.userData.active && activatedCount < particlesToActivate) {
                // Activate this particle
                particle.userData.active = true;
                particle.userData.progress = 0;
                particle.visible = true;
                activatedCount++;
            }
        });
    }
    
    // Function to update synapse particles
    function updateSynapseParticles(connection, delta) {
        // Get source and target positions for the connection
        const sourcePos = connection.userData.source.position;
        const targetPos = connection.userData.target.position;
        
        // Determine flow direction
        const flowingToTarget = connection.userData.flowDirection > 0;
        const startPos = flowingToTarget ? sourcePos : targetPos;
        const endPos = flowingToTarget ? targetPos : sourcePos;
        
        // Update each particle
        connection.userData.synapseParticles.forEach(particle => {
            if (particle.userData.active) {
                // Update progress
                particle.userData.progress += particle.userData.speed * delta;
                
                if (particle.userData.progress >= 1.0) {
                    // Particle reached destination
                    particle.userData.active = false;
                    particle.visible = false;
                } else {
                    // Update position along the connection
                    const t = particle.userData.progress;
                    particle.position.copy(startPos.clone().lerp(endPos, t));
                    
                    // Pulse effect
                    const pulseFactor = Math.sin(t * Math.PI) * 0.5 + 0.5;
                    particle.material.opacity = 0.4 + pulseFactor * 0.6;
                    particle.scale.set(
                        0.05 + pulseFactor * 0.1,
                        0.05 + pulseFactor * 0.1,
                        0.05 + pulseFactor * 0.1
                    );
                }
            } else if (Math.random() < 0.005) {
                // Small random chance to activate a particle
                particle.userData.active = true;
                particle.userData.progress = 0;
                particle.visible = true;
            }
        });
    }
    
    // Create cityscape in the background
    function createCityscape(scene) {
        // City buildings
        const buildingCount = 100;
        const buildingGroup = new THREE.Group();
        buildingGroup.position.z = -50; // Far in the background
        buildingGroup.position.y = -10; // Below the neural network
        
        for (let i = 0; i < buildingCount; i++) {
            // Random building dimensions
            const width = Math.random() * 2 + 0.5;
            const height = Math.random() * 15 + 2;
            const depth = Math.random() * 2 + 0.5;
            
            const geometry = new THREE.BoxGeometry(width, height, depth);
            
            // Building material with window lights
            const material = new THREE.MeshBasicMaterial({
                color: 0x050A14,
                transparent: true, 
                opacity: 0.9
            });
            
            const building = new THREE.Mesh(geometry, material);
            building.position.x = (Math.random() - 0.5) * 80;
            building.position.y = height / 2;
            building.position.z = (Math.random() - 0.5) * 30;
            
            // Add window lights as points
            const windowCount = Math.floor(height * 2);
            for (let w = 0; w < windowCount; w++) {
                if (Math.random() > 0.3) { // Not all windows are lit
                    const windowLight = new THREE.PointLight(
                        // Blue light colors
                        new THREE.Color(
                            Math.random() > 0.5 ? 0x00BFFF : 0x0080FF
                        ),
                        0.05, // Intensity
                        5 // Distance
                    );
                    
                    // Position the light on the building surface
                    const side = Math.floor(Math.random() * 4);
                    let wx = 0, wy = 0, wz = 0;
                    
                    wy = Math.random() * height - height / 2;
                    
                    if (side === 0) {
                        wx = width / 2;
                        wz = (Math.random() - 0.5) * depth;
                    } else if (side === 1) {
                        wx = -width / 2;
                        wz = (Math.random() - 0.5) * depth;
                    } else if (side === 2) {
                        wx = (Math.random() - 0.5) * width;
                        wz = depth / 2;
                    } else {
                        wx = (Math.random() - 0.5) * width;
                        wz = -depth / 2;
                    }
                    
                    windowLight.position.set(wx, wy, wz);
                    building.add(windowLight);
                    
                    // Add small sphere to represent the light
                    const lightPoint = new THREE.Mesh(
                        new THREE.SphereGeometry(0.05, 4, 4),
                        new THREE.MeshBasicMaterial({
                            color: windowLight.color,
                            transparent: true,
                            opacity: 0.8
                        })
                    );
                    lightPoint.position.copy(windowLight.position);
                    building.add(lightPoint);
                }
            }
            
            buildingGroup.add(building);
        }
        
        scene.add(buildingGroup);
        
        // Add city fog/haze
        const cityHaze = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 80),
            new THREE.MeshBasicMaterial({
                color: 0x1B263B,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            })
        );
        cityHaze.position.z = -40;
        cityHaze.position.y = 20;
        scene.add(cityHaze);
        
        // Add distant stars/lights
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 500;
        const starPositions = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        const starColors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            // Position stars all around the scene
            starPositions[i3] = (Math.random() - 0.5) * 200;
            starPositions[i3 + 1] = Math.random() * 100 - 10; // More stars in the upper part
            starPositions[i3 + 2] = (Math.random() - 0.5) * 100 - 60; // Behind the city
            
            // Varied sizes
            starSizes[i] = Math.random() * 0.5 + 0.1;
            
            // Colors: blue tones and white
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
                // Light blue
                starColors[i3] = 0.0;
                starColors[i3 + 1] = 0.75;
                starColors[i3 + 2] = 1.0;
            } else if (colorChoice < 0.8) {
                // Deep blue
                starColors[i3] = 0.0;
                starColors[i3 + 1] = 0.5;
                starColors[i3 + 2] = 0.9;
            } else {
                // White-blue
                starColors[i3] = 0.7;
                starColors[i3 + 1] = 0.8;
                starColors[i3 + 2] = 1.0;
            }
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        
        // Create shader for stars
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);
    }
    
    // Start animation
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
        // Update renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}

// Clock and Date
function initClockAndDate() {
    function updateClock() {
        const now = new Date();
        
        // Update time in top bar
        const timeElement = document.getElementById('current-time');
        timeElement.textContent = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Update date in top bar
        const dateElement = document.getElementById('current-date');
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        dateElement.textContent = `${day} ${month} ${seconds}`;
        
        // Update clock in circular element
        const clockElement = document.getElementById('clock');
        clockElement.textContent = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Update full date in floating element
        const fullDateElement = document.getElementById('full-date');
        fullDateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
}

// Terminal
function initTerminal() {
    const terminal = document.getElementById('terminal');
    const terminalMessages = [
        { text: 'System initialization complete.', delay: 1000 },
        { text: 'All core systems online.', delay: 2000 },
        { text: 'Neural networks calibrated.', delay: 3000 },
        { text: 'Security protocols active.', delay: 4000 },
        { text: 'Welcome, user: AKILESH BAPU', delay: 5000 },
        { text: 'Ready to assist.', delay: 6000 }
    ];
    
    function typeWriter(message, element, index = 0) {
        if (index < message.length) {
            element.textContent += message.charAt(index);
            setTimeout(() => typeWriter(message, element, index + 1), 30);
        }
    }
    
    terminalMessages.forEach((message, i) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.classList.add('terminal-line');
            terminal.appendChild(line);
            typeWriter(message.text, line);
        }, message.delay);
    });
    
    // Blinking cursor animation
    const cursor = document.querySelector('.cursor');
    setInterval(() => {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 500);
}

// System Stats
function initSystemStats() {
    function updateStats() {
        // Simulate changing CPU usage
        const cpuValue = document.querySelector('.status-item:nth-child(1) .status-value');
        const cpuUsage = (Math.random() * 0.2 + 0.05).toFixed(2);
        cpuValue.textContent = `${cpuUsage}%`;
        
        // Update CPU circular dial
        const cpuCircleValue = document.getElementById('cpu-value');
        cpuCircleValue.textContent = `${cpuUsage}%`;
        
        // Update CPU indicator circle
        const cpuIndicator = document.querySelector('.cpu-indicator');
        const cpuPercentage = parseFloat(cpuUsage);
        const cpuDashOffset = 301.59 * (1 - (cpuPercentage / 5)); // Max 5%
        cpuIndicator.style.strokeDashoffset = cpuDashOffset;
        
        // Simulate changing memory usage
        const memoryValue = document.querySelector('.status-item:nth-child(2) .status-value');
        const memoryUsage = (Math.random() * 0.5 + 1.5).toFixed(1);
        memoryValue.textContent = `${memoryUsage} GB`;
        
        // Update Memory circular dial
        const memoryCircleValue = document.getElementById('memory-value');
        memoryCircleValue.textContent = `${memoryUsage} GB`;
        
        // Update Memory indicator circle
        const memoryIndicator = document.querySelector('.memory-indicator');
        const memoryPercentage = parseFloat(memoryUsage);
        const memoryDashOffset = 301.59 * (1 - (memoryPercentage / 8)); // Max 8GB
        memoryIndicator.style.strokeDashoffset = memoryDashOffset;
        
        // Add random pulsing effect to some circles
        const circles = document.querySelectorAll('.circular-element');
        const randomCircle = circles[Math.floor(Math.random() * circles.length)];
        randomCircle.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.7)';
        setTimeout(() => {
            randomCircle.style.boxShadow = 'none';
        }, 500);
    }
    
    // Update stats every 2 seconds
    setInterval(updateStats, 2000);
}

// Audio Visualizer
function initAudioVisualizer() {
    const bars = document.querySelectorAll('.visualizer-bar');
    
    function updateVisualizer() {
        bars.forEach(bar => {
            const height = Math.floor(Math.random() * 100) + 10;
            bar.style.height = `${height}%`;
        });
    }
    
    // Update visualizer bars every 200ms
    setInterval(updateVisualizer, 200);
}

// Chat Interface
function initChatInterface() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const terminalOutput = document.getElementById('terminal');
    const chatPrompt = document.querySelector('.chat-prompt');
    
    // Completely clear the chat prompt first
    chatPrompt.innerHTML = '';
    chatPrompt.style.borderColor = 'rgba(0, 255, 255, 0.6)';
    
    // Typing animation for JARVIS greeting
    const jarvisGreeting = "\"At your service, sir. I am JARVIS, Mr. Stark's artificial intelligence. How can I be of assistance today?\"";
    let i = 0;
    
    // Create a blinking cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.innerHTML = '|';
    chatPrompt.appendChild(cursor);
    
    // Function to add typing sound effect
    function playTypingEffect() {
        // Activate visualizer during typing to simulate sound
        const randomBar = Math.floor(Math.random() * 5);
        const visualizerBars = document.querySelectorAll('.visualizer-bar');
        if (visualizerBars[randomBar]) {
            visualizerBars[randomBar].style.height = '100%';
            setTimeout(() => {
                visualizerBars[randomBar].style.height = `${Math.floor(Math.random() * 50) + 10}%`;
            }, 50);
        }
    }
    
    function typeJarvisGreeting() {
        if (i < jarvisGreeting.length) {
            // Remove cursor
            chatPrompt.removeChild(cursor);
            
            // Add next character
            const char = document.createTextNode(jarvisGreeting.charAt(i));
            chatPrompt.appendChild(char);
            
            // Add cursor back
            chatPrompt.appendChild(cursor);
            
            // Play typing effect
            playTypingEffect();
            
            i++;
            
            // Random typing speed to make it feel more natural
            // Slightly slower for punctuation and spaces to simulate natural pauses
            let speed;
            const currentChar = jarvisGreeting.charAt(i-1);
            if (currentChar === '.' || currentChar === ',' || currentChar === '?') {
                speed = Math.floor(Math.random() * 50) + 150; // Longer pause for punctuation
            } else if (currentChar === ' ') {
                speed = Math.floor(Math.random() * 30) + 80; // Slight pause for spaces
            } else {
                speed = Math.floor(Math.random() * 30) + 40; // Normal typing speed
            }
            
            setTimeout(typeJarvisGreeting, speed);
        } else {
            // Fade border when typing is complete
            setTimeout(() => {
                chatPrompt.style.borderColor = 'rgba(0, 255, 255, 0.2)';
            }, 1000);
        }
    }
    
    // Start typing animation after a slight delay
    setTimeout(typeJarvisGreeting, 1500);
    
    // Add focus effect to input field
    chatInput.addEventListener('focus', () => {
        chatInput.style.boxShadow = '0 0 15px var(--glow-color)';
    });
    
    chatInput.addEventListener('blur', () => {
        chatInput.style.boxShadow = 'none';
    });
    
    // Add typing sound effect
    chatInput.addEventListener('keydown', () => {
        // Simulate typing sound with audio if needed
        // For now, just add a visual effect
        const randomBar = Math.floor(Math.random() * 5);
        const visualizerBars = document.querySelectorAll('.visualizer-bar');
        if (visualizerBars[randomBar]) {
            visualizerBars[randomBar].style.height = '100%';
            setTimeout(() => {
                visualizerBars[randomBar].style.height = `${Math.floor(Math.random() * 50) + 10}%`;
            }, 100);
        }
    });
    
    // Handle form submission
    chatForm.addEventListener('submit', (e) => {
        // Don't prevent default as we want the mailto: to work
        // But add some visual feedback
        const message = chatInput.value.trim();
        
        if (message) {
            // Add the message to the terminal
            const line = document.createElement('div');
            line.classList.add('terminal-line');
            line.textContent = `USER: ${message}`;
            terminalOutput.appendChild(line);
            
            // Add a response line with typing effect
            setTimeout(() => {
                const responseLine = document.createElement('div');
                responseLine.classList.add('terminal-line');
                responseLine.textContent = '';
                terminalOutput.appendChild(responseLine);
                
                const response = `JARVIS: Message sent to akilesh@berkeley.edu. I'll ensure Mr. Stark receives it promptly.`;
                let j = 0;
                
                function typeResponse() {
                    if (j < response.length) {
                        responseLine.textContent += response.charAt(j);
                        j++;
                        setTimeout(typeResponse, Math.floor(Math.random() * 20) + 10);
                    }
                }
                
                typeResponse();
                
                // Scroll to bottom of terminal
                const consoleContent = document.querySelector('.console-content');
                consoleContent.scrollTop = consoleContent.scrollHeight;
            }, 500);
        }
    });
}
