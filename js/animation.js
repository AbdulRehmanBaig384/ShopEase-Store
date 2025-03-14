document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initWaves();
    initMouseEffects();
    addButtonShine();
});

// Create floating particles
function initParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-background';
    document.body.appendChild(particlesContainer);
    
    const numberOfParticles = window.innerWidth > 768 ? 15 : 8;
    
    for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.floor(Math.random() * 80) + 40; 
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${15 + Math.random() * 15}s`;
        particlesContainer.appendChild(particle);
    }
}


function initWaves() {
    const waveContainer = document.createElement('div');
    waveContainer.className = 'wave-background';
    document.body.appendChild(waveContainer);
    
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = 'wave';
        waveContainer.appendChild(wave);
    }
}


function initMouseEffects() {
  
    if (window.innerWidth < 768) return;
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);
    
    document.addEventListener('mousemove', function(e) {

        cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        
        
        setTimeout(() => {
            cursorOutline.style.transform = `translate(${e.clientX - 15}px, ${e.clientY - 15}px)`;
        }, 50);
    });
 
    const interactiveElements = document.querySelectorAll('a, button, .card, input, .nav-link');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '50px';
            cursorOutline.style.height = '50px';
            cursorOutline.style.borderColor = 'rgba(33, 150, 243, 0.8)';
        });
        element.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '30px';
            cursorOutline.style.height = '30px';
            cursorOutline.style.borderColor = 'rgba(33, 150, 243, 0.5)';
        });
    });
}


function addButtonShine() {
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(button => {
        button.classList.add('btn-shine');
    });
}
function addHeroGlow() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const glow = document.createElement('div');
        glow.className = 'hero-glow';
        heroSection.style.position = 'relative';
        heroSection.style.overflow = 'hidden';
        heroSection.appendChild(glow);
    }
}

function addSectionDividers() {
    const sections = document.querySelectorAll('section');
    
    for (let i = 0; i < sections.length - 1; i++) {
        const divider = document.createElement('div');
        divider.className = 'section-divider';
        
        const wave = document.createElement('div');
        wave.className = 'divider-wave';
        divider.appendChild(wave);
        
        sections[i].after(divider);
    }
}

document.addEventListener('theme-changed', function(e) {
    const theme = e.detail.theme;
    console.log(`Theme changed to ${theme}`);
});

function checkReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .particle, .wave, .hero-glow, .btn-shine::after {
                animation: none !important;
                transition: none !important;
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

checkReducedMotion(); 