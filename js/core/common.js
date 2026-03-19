/**
 * Shared logic for all pages
 */
document.addEventListener('DOMContentLoaded', function () {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        if (!navbar) return;

        // Navbar scrolled state (glass effect)
        if (window.scrollY > 30) {
            navbar.classList.add('navbar-scrolled', 'shadow-sm');
        } else {
            // Only remove if it's not the exams page (which has it by default in HTML)
            // But we can check for a specific class or just let the script handle it
            if (!document.body.classList.contains('bg-light-green') || window.location.pathname.includes('index.html')) {
                if (!window.location.pathname.includes('exams.html')) {
                    navbar.classList.remove('navbar-scrolled', 'shadow-sm');
                }
            }
        }

        // Section tracking for active state (navigation highlight)
        if (sections.length > 0) {
            let currentSection = "";
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= (sectionTop - 150)) {
                    currentSection = section.getAttribute("id");
                }
            });

            // Ensure Home is active if at top
            if (window.scrollY < 10 && document.getElementById('home')) {
                currentSection = "home";
            }

            if (currentSection) {
                navLinks.forEach((link) => {
                    const href = link.getAttribute("href");
                    
                    // If on exams page, keep Practice Test active
                    if (window.location.pathname.includes('exams.html')) {
                        link.classList.remove("active");
                        if (href.includes("#practice-test")) {
                            link.classList.add("active");
                        }
                        return;
                    }

                    // On other pages (like index), follow scroll position
                    link.classList.remove("active");
                    if (href === `#${currentSection}` || href === `index.html#${currentSection}`) {
                        link.classList.add("active");
                    }
                });
            } else if (window.location.pathname.includes('exams.html')) {
                // Special case for exams page if no sections are found/visible
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href").includes("#practice-test")) {
                        link.classList.add("active");
                    }
                });
            }
        }
    }

    window.addEventListener('scroll', updateActiveLink);
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
});
