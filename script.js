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

// Smooth Scroll Logic using Lerp
let currentProgress = 0;
let targetProgress = 0;

const renderLoop = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight > 0) {
        targetProgress = scrollTop / scrollHeight;
    }

    // Smooth lerp for cinematic precision (0.05 friction factor)
    currentProgress += (targetProgress - currentProgress) * 0.05;

    // We break the scroll progress into specific cinematic keyframes:
    let offsetD, radius, heightOffset;
    const orbitAngle = currentProgress * 720; // 2 Full 360 rotations total as you scroll for extra wow factor
    const fieldOfView = 15 + (currentProgress * 15); // zooms out overall

    if (currentProgress < 0.15) {
        // 1. [0.0 to 0.15]: Start Page (Intro Section) 
        // Start perfectly centered, wide shot.
        let p = currentProgress / 0.15; // 0 to 1

        offsetD = p * 1.2; // Starts at 0 (center), goes to 1.2 (right edge)
        radius = 2.5 - (p * 1.3); // Starts at wide 2.5, zooms firmly into tight 1.2
        heightOffset = p * -0.4; // Starts 0 (vertically centered), pans to -0.4 (camera looks up)

    } else if (currentProgress < 0.80) {
        // 2. [0.15 to 0.80]: Hero Text and Widgets
        // Keep bike locked hard right, slowly tracking wide over the texts.
        let p = (currentProgress - 0.15) / 0.65; // 0 to 1

        offsetD = 1.2; // Stay right
        radius = 1.2 + (p * 1.0); // Slowly zoom out from tight 1.2 to medium 2.2
        heightOffset = -0.4 + (p * 0.4); // Slowly pan down vertically

    } else {
        // 3. [0.80 to 1.0]: Final scroll into the Ready to Ride section
        // Bring the bike back exactly to the absolute center.
        let p = (currentProgress - 0.80) / 0.20; // 0 to 1

        offsetD = 1.2 - (p * 1.2); // Snap back to 0 (centered)
        radius = 2.2 + (p * 0.8); // Continue wide to 3.0
        heightOffset = 0 + (p * 0.8); // Frame appropriately for final view
    }

    // Calculate world X and Z to shift camera target left/right purely relative to camera perspective
    const rad = orbitAngle * Math.PI / 180;
    const panX = offsetD * -Math.cos(rad);
    const panZ = offsetD * Math.sin(rad);

    // Inject into the Model Viewer attributes
    modelViewer.cameraOrbit = `${orbitAngle}deg 75deg ${radius}m`;
    modelViewer.cameraTarget = `${panX}m ${heightOffset}m ${panZ}m`;
    modelViewer.fieldOfView = `${fieldOfView}deg`;

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