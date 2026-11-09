const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const backToTopBtn = document.querySelector('.back-to-top-btn');
const scrollElements = document.querySelectorAll('.about p, .contact p');
const serviceCards = document.querySelectorAll('.service-card');
const body = document.body;

// Event listener para el botón de alternar menú (abre/cierra el menú móvil)
if (menuToggle && nav && header) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        nav.setAttribute('aria-hidden', String(isExpanded));
        menuToggle.classList.toggle('active'); // Anima el icono
        nav.classList.toggle('active');
        body.classList.toggle('no-scroll'); // Bloquea/desbloquea el scroll
        header.classList.toggle('menu-active'); // Añade/quita la clase para controlar el fondo del header

        if (!isExpanded) {
            // Si el menú se abre, enfocar el primer enlace del menú para accesibilidad
            const firstNavLink = nav.querySelector('a');
            if (firstNavLink) {
                firstNavLink.focus();
            }
        } else {
            // Si el menú se cierra, devolver el foco al botón del menú
            menuToggle.focus();
        }
    });
}

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
        if (nav && menuToggle && header && nav.classList.contains('active')) {
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
    const headerHeight = header ? header.offsetHeight : 0;

    let currentActive = null;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight; // Ajustar por la altura del header fijo
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

// Optimización: usar requestAnimationFrame para scroll events
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            if (header && window.scrollY > 50) {
                header.classList.add('scrolled');
            } else if (header) {
                header.classList.remove('scrolled');
            }

            if (backToTopBtn && window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else if (backToTopBtn) {
                backToTopBtn.classList.remove('show');
            }
            highlightActiveNavLink();
            handleScrollAnimation();
            
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true });

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
    // Limpiar will-change después de la animación para liberar recursos
    element.addEventListener('transitionend', () => {
        element.style.willChange = 'auto';
    }, { once: true });
};

// Manejador de animaciones al hacer scroll
const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
            displayScrollElement(el);
        }
    });
}

// Ejecutar la animación al cargar la página para los elementos visibles inicialmente
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 768;
    
    // Solo animar si no es mobile
    if (!isMobile) {
        setTimeout(() => {
            serviceCards.forEach((el, index) => {
                setTimeout(() => {
                    displayScrollElement(el);
                }, index * 200); // 200ms de retraso entre cada tarjeta
            });
        }, 200); // 200ms de retraso inicial
    } else {
        // En mobile, mostrar elementos inmediatamente sin animación
        serviceCards.forEach(el => {
            el.classList.add('visible');
        });
    }

    handleScrollAnimation();
    highlightActiveNavLink(); // Llamar al cargar la página para establecer el estado inicial

    // Lógica para el acordeón de preguntas frecuentes
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            // Al abrir uno, cerramos el resto para mantener comportamiento de acordeón
            if (!item.open) {
                return;
            }

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.open = false;
                }
            });
        });
    });
});

// Consulta por WhatsApp: arma el mensaje con los datos del formulario y abre
// WhatsApp con la consulta escrita (no pasa por ningun servidor). La conversion
// la cuenta el manejador de abajo, igual que un clic en un link a WhatsApp.
const consulta = document.getElementById('consulta');

if (consulta) {
    const unir = (items) => items.length < 2
        ? items.join('')
        : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

    consulta.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = new FormData(consulta);
        const limpio = (campo) => (d.get(campo) || '').replace(/\s+/g, ' ').trim();
        const servicios = d.getAll('servicio');

        let texto = `Hola, los vi en su web y necesito un presupuesto. Soy ${limpio('nombre')}, de ${limpio('zona')}.`;
        if (servicios.length) texto += ` Necesito ${unir(servicios)}.`;
        if (limpio('mensaje')) texto += ` ${limpio('mensaje')}`;

        // Sin 'noopener' en window.open: con esa opcion devuelve null siempre
        // y no se podria saber si el navegador bloqueo la ventana.
        const url = `https://wa.me/59891665895?text=${encodeURIComponent(texto)}`;
        const ventana = window.open(url, '_blank');
        if (ventana) ventana.opener = null;
        else window.location.href = url;
    });
}

// Conversion "Clic en WhatsApp" de la cuenta de Google Ads de jvx (AW-18565674613;
// el gtag('config') esta en el head). Un solo manejador en el documento cuenta los
// clics en links a WhatsApp y el envio del formulario de consulta, una vez cada uno.
// No demora la apertura de WhatsApp: no hay preventDefault, y con
// transport_type 'beacon' el envio llega aunque el link cambie de pagina en la
// misma pestaña. A Google Analytics (G-ZNQ3C0HB8L) le llega el mismo toque como
// evento contacto_whatsapp, con origen 'link' o 'formulario', para marcarlo como
// evento clave.
const CONVERSION_WHATSAPP = 'AW-18565674613/1tX2CKqxlbUdEPXs5pRF';
const ANALYTICS = 'G-ZNQ3C0HB8L';
const HOSTS_WHATSAPP = ['wa.link', 'wa.me', 'api.whatsapp.com'];

const esWhatsapp = (e) => {
    if (e.type === 'submit') return e.target === consulta;
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a) return false;
    try {
        return HOSTS_WHATSAPP.includes(new URL(a.href).hostname.replace(/^www\./, ''));
    } catch {
        return false;
    }
};

const medirConversionWhatsapp = (e) => {
    if (!esWhatsapp(e) || typeof gtag !== 'function') return;
    gtag('event', 'conversion', {
        send_to: CONVERSION_WHATSAPP,
        transport_type: 'beacon'
    });
    gtag('event', 'contacto_whatsapp', {
        send_to: ANALYTICS,
        origen: e.type === 'submit' ? 'formulario' : 'link',
        transport_type: 'beacon'
    });
};

document.addEventListener('click', medirConversionWhatsapp);
document.addEventListener('submit', medirConversionWhatsapp);
