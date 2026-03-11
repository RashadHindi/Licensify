/**
 * Home Page specific logic
 */
document.addEventListener('DOMContentLoaded', function () {
    // Handle image error for hero visual
    const heroImg = document.getElementById('hero-img');
    if (heroImg) {
        heroImg.addEventListener('error', function () {
            this.style.display = 'none';
            const shape = document.querySelector('.fallback-hero-shape');
            if (shape) shape.style.opacity = '1';
        });
    }
});
