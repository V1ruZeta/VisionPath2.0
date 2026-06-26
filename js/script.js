/* =============================================================
   VISIONPATH — script.js
   Lógica principal: navbar, animaciones, interacciones
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // NAVBAR — scroll + hamburger + active link
    // =========================================================

    const header      = document.getElementById('header');
    const hamburger   = document.querySelector('.hamburger');
    const navLinks    = document.querySelector('.nav-links');
    const navAnchors  = document.querySelectorAll('.nav-links a');

    // Efecto scroll
    if (header) {
        const onScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 60);

            // Botón scroll-top
            const st = document.getElementById('scrollTop');
            if (st) st.classList.toggle('visible', window.scrollY > 400);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Hamburger menú
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        // Cerrar al hacer clic en un link
        navAnchors.forEach(a => {
            a.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target)) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            }
        });
    }

    // Link activo según la página
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navAnchors.forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.includes(currentPage) && !href.includes('#')) {
            a.classList.add('active');
        }
    });

    // =========================================================
    // INTERSECTION OBSERVER — aparición de secciones
    // =========================================================

    const hiddenEls = document.querySelectorAll('.hidden');

    if (hiddenEls.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        hiddenEls.forEach(el => observer.observe(el));
    }

    // =========================================================
    // EFECTO TARJETAS — gradiente radial al mover el mouse
    // =========================================================

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.background =
                `radial-gradient(circle at ${x}px ${y}px,
                 rgba(56,189,248,0.18),
                 rgba(30,41,59,0.6) 70%)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.background = '';
        });
    });

    // =========================================================
    // SCROLL SUAVE — links internos con ancla
    // =========================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 90;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // =========================================================
    // BOTÓN SCROLL-TOP
    // =========================================================

    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =========================================================
    // FORMULARIO DE CONTACTO
    // =========================================================

    const form = document.querySelector('.contact-form');
    const formSuccess = document.querySelector('.form-success');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Enviando...';
            }

            // Simulación de envío (reemplazar con Formspree/EmailJS en producción)
            setTimeout(() => {
                form.style.display = 'none';
                if (formSuccess) {
                    formSuccess.style.display = 'block';
                }
            }, 1200);
        });
    }

    // =========================================================
    // PARALLAX SUAVE EN EL HERO
    // =========================================================

    const heroImg = document.querySelector('.hero-image img');
    if (heroImg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroImg.style.transform = `translateY(${scrollY * 0.06}px)`;
            }
        }, { passive: true });
    }

    // =========================================================
    // ANIMACIÓN DE NÚMEROS EN STATS (contador)
    // =========================================================

    function animateCounter(el, target, suffix = '') {
        let start = 0;
        const duration = 1800;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            const value = Math.floor(eased * target);
            el.textContent = value.toLocaleString('es-CL') + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    const statEls = document.querySelectorAll('[data-count]');
    if (statEls.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el     = entry.target;
                    const target = parseFloat(el.dataset.count);
                    const suffix = el.dataset.suffix || '';
                    animateCounter(el, target, suffix);
                    statsObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statEls.forEach(el => statsObserver.observe(el));
    }

    // =========================================================
    // RIPPLE EN BOTONES
    // =========================================================

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect   = this.getBoundingClientRect();
            const size   = Math.max(rect.width, rect.height);
            const x      = e.clientX - rect.left - size / 2;
            const y      = e.clientY - rect.top  - size / 2;
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px; height: ${size}px;
                left: ${x}px; top: ${y}px;
                background: rgba(255,255,255,0.18);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-anim 0.55s ease-out forwards;
                pointer-events: none;
            `;
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    // Keyframe ripple (se inyecta una vez)
    if (!document.getElementById('ripple-style')) {
        const s = document.createElement('style');
        s.id = 'ripple-style';
        s.textContent = `
            @keyframes ripple-anim {
                to { transform: scale(2.5); opacity: 0; }
            }
        `;
        document.head.appendChild(s);
    }

    // =========================================================
    // EFECTO LOGO
    // =========================================================

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // =========================================================
    // LOADED (fade-in inicial del body)
    // =========================================================

    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        document.body.style.opacity = '1';
    });

    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

});
