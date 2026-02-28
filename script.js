// --- Creative Effects: Text Decoding ---
const decodeText = (element, targetText, duration = 1000) => {
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    let iterations = 0;
    const interval = setInterval(() => {
        element.innerText = targetText.split("")
            .map((char, index) => {
                if (index < iterations) return targetText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iterations >= targetText.length) clearInterval(interval);
        iterations += 1 / 3;
    }, 30);
};

// --- Data Stream Rolling ---
const updateDataStream = () => {
    const stream = document.getElementById('data-stream');
    if (!stream) return;
    const lines = [
        ">> SCANNING_GEOMETRY...",
        ">> CALCULATING_AERODYNAMICS...",
        ">> BATTERY_CELL_VOLTAGE: 3.8V",
        ">> SYNCING_WITH_SATELLITE...",
        ">> TORQUE_PEAK: 95Nm",
        ">> THERMAL_MANAGEMENT: STABLE"
    ];
    setInterval(() => {
        const newLine = document.createElement('span');
        newLine.innerText = lines[Math.floor(Math.random() * lines.length)];
        stream.appendChild(document.createElement('br'));
        stream.appendChild(newLine);
        if (stream.children.length > 20) {
            stream.removeChild(stream.firstChild);
            stream.removeChild(stream.firstChild);
        }
    }, 3000);
};

window.addEventListener('DOMContentLoaded', () => {
    updateDataStream();
    const title = document.querySelector('.hero-title');
    if (title) decodeText(title, title.innerText);
});

const modelViewer = document.querySelector("#bike-viewer");

modelViewer.addEventListener("load", () => {
    // Select the bike's material
    const material = modelViewer.model.materials[0];

    // 1. Set color to Pure Black
    material.pbrMetallicRoughness.setBaseColorFactor([0, 0, 0, 1]);

    // 2. Set Metallic to 1.0 (Maximum)
    material.pbrMetallicRoughness.setMetallicFactor(1.0);

    // 3. Set Roughness to 0.03 (Mirror-like reflection)
    material.pbrMetallicRoughness.setRoughnessFactor(0.03);
});

// Progress bar logic
const onProgress = (event) => {
    const progressBar = event.target.querySelector('.progress-bar');
    const updatingBar = event.target.querySelector('.update-bar');
    if (updatingBar) {
        updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
    }
    if (event.detail.totalProgress === 1) {
        progressBar.classList.add('hide');
    }
};
modelViewer.addEventListener('progress', onProgress);

// Smooth Scroll & Mouse Parallax
let currentProgress = 0;
let targetProgress = 0;
let mouseX = 0;
let mouseY = 0;
let currentMouseX = 0;
let currentMouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
});

const renderLoop = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight > 0) {
        targetProgress = scrollTop / scrollHeight;
    }

    // Smooth lerp for cinematic precision (0.12 friction factor for faster response)
    currentProgress += (targetProgress - currentProgress) * 0.12;

    // Mouse Smoothing
    currentMouseX += (mouseX - currentMouseX) * 0.05;
    currentMouseY += (mouseY - currentMouseY) * 0.05;

    // We break the scroll progress into specific cinematic keyframes:
    let offsetD, radius, heightOffset;

    // Smooth 360 rotation for a normal, cool speed
    const orbitAngle = currentProgress * 360;
    const fieldOfView = 30; // Lock FOV to 30 for much more stable, normal proportion sizing

    // INCREASE RADIUS to make bike look smaller/further away
    const baseRadius = 4.5;

    if (currentProgress < 0.15) {
        // 1. [0.0 to 0.15]: Start Page (Intro Section) 
        // Start perfectly centered, wide shot.
        let p = currentProgress / 0.15; // 0 to 1

        offsetD = p * 1.8; // Move to the right
        radius = baseRadius + (p * -0.5); // Zooms gently from 4.5 to 4.0
        heightOffset = p * -0.15;

    } else if (currentProgress < 0.45) {
        // 2. [0.15 to 0.45]: Hero Text
        // Keep bike locked HARD RIGHT to avoid text.
        offsetD = 1.8;
        radius = 4.0;  // Stay at a comfortable 'normal' size
        heightOffset = -0.15;

    } else if (currentProgress < 0.70) {
        // 3. [0.45 to 0.70]: Center Break / Transition
        // Bike moves back to right for widgets
        let p = (currentProgress - 0.45) / 0.25; // 0 to 1

        offsetD = 1.8; // Stay on the right
        radius = 4.0 + (p * 0.2);
        heightOffset = -0.15 + (p * 0.25);

    } else {
        // 4. [0.70 to 1.0]: Final scroll into the Ready to Ride section
        // Bring the bike back exactly to the absolute center.
        let p = (currentProgress - 0.70) / 0.30; // 0 to 1

        offsetD = 1.8 - (p * 1.8); // Snap back to 0 (centered)
        radius = 4.2 + (p * 0.3); // Zoom out slightly for final view
        heightOffset = 0.1 + (p * 0.3);
    }

    // Calculate world X and Z to shift camera target left/right purely relative to camera perspective
    const rad = orbitAngle * Math.PI / 180;
    const panX = offsetD * -Math.cos(rad);
    const panZ = offsetD * Math.sin(rad);

    // Inject into the Model Viewer attributes
    modelViewer.cameraOrbit = `${orbitAngle}deg 75deg ${radius}m`;

    // Add subtle mouse parallax to the target for extra "cool" points
    const finalPanX = panX + (currentMouseX * 0.2);
    const finalPanY = heightOffset - (currentMouseY * 0.1);

    modelViewer.cameraTarget = `${finalPanX}m ${finalPanY}m ${panZ}m`;
    modelViewer.fieldOfView = `${fieldOfView}deg`;

    // Fade the fixed scroll hint based on progress
    const scrollHint = document.getElementById('fixed-scroll-hint');
    if (scrollHint) {
        if (currentProgress > 0.01) {
            scrollHint.style.opacity = '0';
            scrollHint.style.pointerEvents = 'none';
        } else {
            scrollHint.style.opacity = '0.6';
            scrollHint.style.pointerEvents = 'auto';
        }
    }

    requestAnimationFrame(renderLoop);
};

// Start the physics loop
requestAnimationFrame(renderLoop);

// Intersection Observer for Cinematic Text Fading
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        } else {
            entry.target.classList.remove("visible");
        }
    });
}, { threshold: 0.5 }); // Fade in when halfway up the screen

document.querySelectorAll(".scroll-section").forEach(section => {
    sectionObserver.observe(section);
});

// Cool Vibe: Floating Particle System
const canvas = document.getElementById("bg-particles");
const ctx = canvas.getContext("2d");
let width, height;
let particles = [];

const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
};
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.s = Math.random() * 1.5; // size
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.alpha = Math.random() * 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        // make them twinkle based on scroll velocity
        let vel = Math.abs(currentProgress - targetProgress);
        this.alpha = Math.min(0.8, this.alpha + (vel * 0.05));
        if (this.alpha > 0.1) this.alpha -= 0.005;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 150; i++) {
    particles.push(new Particle());
}

const drawParticles = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Parallax the ambient glow with the scroll
    const glow = document.querySelector(".ambient-glow");
    if (glow) {
        glow.style.transform = `translate(-50%, calc(-50% + ${currentProgress * 200}px))`;
    }

    requestAnimationFrame(drawParticles);
}
drawParticles();