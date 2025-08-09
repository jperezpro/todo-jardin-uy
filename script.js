const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const backToTopBtn = document.querySelector('.back-to-top-btn');
const scrollElements = document.querySelectorAll('.service-card, .testimonial-card, .about p, .contact p');
const body = document.body;

// Event listener para el botón de alternar menú (abre/cierra el menú móvil)
menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    nav.setAttribute('aria-hidden', isExpanded);
    menuToggle.classList.toggle('active'); // Anima el icono
    nav.classList.toggle('active');
    body.classList.toggle('no-scroll'); // Bloquea/desbloquea el scroll
    header.classList.toggle('menu-active'); // Añade/quita la clase para controlar el fondo del header

    if (!isExpanded) {
        // Si el menú se abre, enfocar el primer enlace del menú para accesibilidad
        nav.querySelector('a').focus();
    } else {
        // Si el menú se cierra, devolver el foco al botón del menú
        menuToggle.focus();
    }
});

// Desplazamiento suave para enlaces de anclaje
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }

        // Cierra el menú móvil si está abierto después de hacer clic en un enlace
        if (nav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            body.classList.remove('no-scroll'); // Asegura que el scroll se reactive
            header.classList.remove('menu-active'); // Quita la clase del header
            menuToggle.setAttribute('aria-expanded', 'false');
            nav.setAttribute('aria-hidden', 'true');
            menuToggle.focus(); // Devolver el foco al botón del menú
        }
    });
});

// Función para resaltar el enlace de navegación activo
const highlightActiveNavLink = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentActive = null;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - header.offsetHeight; // Ajustar por la altura del header fijo
        const sectionBottom = sectionTop + section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            currentActive = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentActive) {
            link.classList.add('active');
        }
    });
};

// Manejo de la transparencia del encabezado y visibilidad del botón "volver arriba" al hacer scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
    highlightActiveNavLink(); // Llamar a la función para resaltar el enlace activo
});

// Función para determinar si un elemento está a la vista
const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
};

// Función para mostrar un elemento añadiendo la clase 'visible'
const displayScrollElement = (element) => {
    element.classList.add('visible');
};

// Manejador de animaciones al hacer scroll
const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
            displayScrollElement(el);
        }
    });
}

// Event listener para ejecutar animaciones al hacer scroll
window.addEventListener('scroll', () => {
    handleScrollAnimation();
});

// Ejecutar la animación al cargar la página para los elementos visibles inicialmente
document.addEventListener('DOMContentLoaded', () => {
    handleScrollAnimation();
    highlightActiveNavLink(); // Llamar al cargar la página para establecer el estado inicial
});