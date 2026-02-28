const modelViewer = document.querySelector("#bike-viewer");

// --- Advanced Text Scramble Effect ---
const scrambleText = (element) => {
    const originalText = element.innerText;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let iterations = 0;

    element.style.opacity = "1";
    element.style.transform = "translateY(0)";

    const interval = setInterval(() => {
        element.innerText = originalText.split("")
            .map((char, index) => {
                if (index < iterations) return originalText[index];
                if (char === "<" || char === "br" || char === ">") return char; // skip tags
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 3;
    }, 30);
};

// --- Intersection Observer for Slick Reveals ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            const titles = entry.target.querySelectorAll(".hero-title");
            titles.forEach(title => {
                if (title.getAttribute("data-revealed") !== "true") {
                    scrambleText(title);
                    title.setAttribute("data-revealed", "true");
                }
            });
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll(".scroll-section").forEach(section => {
    revealObserver.observe(section);
});

// --- Cinematic Scroll System ---
window.addEventListener("scroll", () => {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

    // Rotate model 360 degrees smoothly
    const rotation = scrollPercent * 360;
    modelViewer.cameraOrbit = `${rotation}deg 75deg 4.5m`;

    // Parallax logic for subtle depth
    const liquidBlob = document.querySelector(".liquid-blob");
    if (liquidBlob) {
        liquidBlob.style.transform = `translate(${window.scrollY * 0.1}px, ${window.scrollY * 0.05}px) rotate(${window.scrollY * 0.02}deg)`;
    }
});

// --- Model Material Refinement ---
modelViewer.addEventListener("load", () => {
    const material = modelViewer.model.materials[0];
    material.pbrMetallicRoughness.setBaseColorFactor([0.02, 0.02, 0.02, 1]); // Specialized Carbon Black
    material.pbrMetallicRoughness.setMetallicFactor(0.9);
    material.pbrMetallicRoughness.setRoughnessFactor(0.1);
});

// --- Background Particles Support (Placeholder) ---
const initParticles = () => {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Minimalist particle logic can be added here
};

window.addEventListener('resize', initParticles);
initParticles();