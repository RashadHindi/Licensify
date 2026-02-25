document.addEventListener('DOMContentLoaded', function () {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        // Navbar scrolled state (glass effect)
        if (window.scrollY > 30) {
            navbar.classList.add('navbar-scrolled', 'shadow-sm');
        } else {
            navbar.classList.remove('navbar-scrolled', 'shadow-sm');
        }

        // Section tracking for active state
        let currentSection = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSection = section.getAttribute("id");
            }
        });

        // Ensure Home is active if at top
        if (window.scrollY < 10) {
            currentSection = "home";
        }

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // Trigger initially
    updateActiveLink();

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-fade, .fade-up-element, .fade-in-element').forEach((el) => {
        observer.observe(el);
    });

    // Handle image error for hero visual
    const heroImg = document.getElementById('hero-img');
    if (heroImg) {
        heroImg.addEventListener('error', function () {
            this.style.display = 'none';
            document.querySelector('.fallback-hero-shape').style.opacity = '1';
        });
    }
});
