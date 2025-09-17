
import '../css/index.css';

// Importar módulos
import { BannerRotator } from './modules/BannerRotator.js';
import { MobileMenu } from './modules/MobileMenu.js';
import { ContactForm } from './modules/ContactForm.js';
import { ImageModal } from './modules/ImageModal.js';
import { LazyLoading } from './modules/LazyLoading.js';
import { WhatsAppButton } from './modules/WhatsAppButton.js';
import { AnimationObserver } from './modules/AnimationObserver.js';

/**
 * Clase principal de la aplicación Pan & Oro
 */
class PanOroApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        
        // Error handling
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleError);
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('🥖 Iniciando Pan & Oro App...');
            
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Inicializar componentes
            await this.initializeComponents();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Marcar como inicializada
            this.isInitialized = true;
            
            console.log('✅ Pan & Oro App inicializada correctamente');
            
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('panoro:initialized'));
            
        } catch (error) {
            console.error('❌ Error al inicializar Pan & Oro App:', error);
            this.handleError(error);
        }
    }

    /**
     * Inicializa todos los componentes
     */
    async initializeComponents() {
        const initPromises = [];

        try {
            // Banner Rotator
            const bannerElement = document.querySelector('.banner-rotator');
            if (bannerElement) {
                this.components.bannerRotator = new BannerRotator(bannerElement, {
                    autoPlay: true,
                    autoPlayDelay: 5000,
                    showIndicators: true,
                    enableTouch: true
                });
                initPromises.push(this.components.bannerRotator.init());
            }

            // Mobile Menu
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenuBtn && mobileMenu) {
                this.components.mobileMenu = new MobileMenu(mobileMenuBtn, mobileMenu);
                initPromises.push(this.components.mobileMenu.init());
            }

            // Contact Form
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                this.components.contactForm = new ContactForm(contactForm);
                initPromises.push(this.components.contactForm.init());
            }

            // Image Modal
            const galleryImages = document.querySelectorAll('.gallery-item img');
            if (galleryImages.length > 0) {
                this.components.imageModal = new ImageModal();
                initPromises.push(this.components.imageModal.init());
            }

            

            // Lazy Loading
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            if (lazyImages.length > 0) {
                this.components.lazyLoading = new LazyLoading();
                initPromises.push(this.components.lazyLoading.init());
            }

            // WhatsApp Button
            const whatsappBtn = document.querySelector('.floating-btn');
            if (whatsappBtn) {
                this.components.whatsappButton = new WhatsAppButton(whatsappBtn, {
                    phoneNumber: '+573001112233',
                    message: '¡Hola! Me interesa conocer más sobre Pan & Oro'
                });
                initPromises.push(this.components.whatsappButton.init());
            }

            // Animation Observer
            this.components.animationObserver = new AnimationObserver({
                selector: '.fade-in, [data-animate], .card, .galeria-grid > .gallery-item',
                enableStagger: true,
                staggerDelay: 100
            });
            initPromises.push(this.components.animationObserver.init());

            // Esperar a que todos los componentes se inicialicen
            await Promise.all(initPromises);
            
        } catch (error) {
            console.error('Error inicializando componentes:', error);
            throw error;
        }
    }

    /**
     * Configura eventos globales
     */
    setupGlobalEvents() {
        // Scroll header effect
        let lastScrollY = window.scrollY;
        const header = document.getElementById('header');
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (header) {
                if (currentScrollY > 100) {
                    header.classList.add('shadow-lg');
                    header.classList.add('bg-white/95');
                    header.classList.add('backdrop-blur-sm');
                } else {
                    header.classList.remove('shadow-lg');
                    header.classList.remove('bg-white/95');
                    header.classList.remove('backdrop-blur-sm');
                }
                
                // Hide/show header on scroll
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scrolling down - hide header
                    header.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up - show header
                    header.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
        };

        // Throttle scroll event
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Resize event
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        
        // Focus trap for accessibility
        document.addEventListener('focusin', this.handleFocus.bind(this));

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Configura monitoreo de rendimiento
     */
    setupPerformanceMonitoring() {
        // Web Vitals si están disponibles
        if ('web-vital' in window) {
            // Monitor Core Web Vitals
            const vitalsCallback = (metric) => {
                console.log(`📊 ${metric.name}:`, metric.value);
            };
            
            // Esta sería la implementación real con web-vitals library
            // getCLS(vitalsCallback);
            // getFID(vitalsCallback);
            // getLCP(vitalsCallback);
        }

        // Monitor load performance
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`🚀 Tiempo de carga total: ${loadTime}ms`);
        });
    }

    /**
     * Maneja cambios de tamaño de ventana
     */
    handleResize() {
        // Notificar a componentes sobre resize
        Object.values(this.components).forEach(component => {
            if (typeof component.onResize === 'function') {
                component.onResize();
            }
        });
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('panoro:resize'));
    }

    /**
     * Maneja navegación por teclado
     */
    handleKeyboardNavigation(event) {
        // Escape key - cerrar modales
        if (event.key === 'Escape') {
            if (this.components.imageModal && this.components.imageModal.isOpen) {
                this.components.imageModal.close();
            }
            if (this.components.mobileMenu && this.components.mobileMenu.isOpen) {
                this.components.mobileMenu.close();
            }
        }
        
        // Arrow keys para banner
        if (this.components.bannerRotator) {
            if (event.key === 'ArrowLeft') {
                this.components.bannerRotator.prevSlide();
            } else if (event.key === 'ArrowRight') {
                this.components.bannerRotator.nextSlide();
            }
        }

        // Ctrl+K para enfocar búsqueda (si existiera)
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            // Focus search if exists
        }
    }

    /**
     * Maneja eventos de foco para accesibilidad
     */
    handleFocus(event) {
        const focusedElement = event.target;
        
        // Asegurar que elementos focalizados sean visibles
        if (focusedElement && typeof focusedElement.scrollIntoView === 'function') {
            focusedElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }

    /**
     * Maneja errores globales
     */
    handleError(event) {
        console.error('Error capturado:', event.error || event.reason || event);
        
        // Enviar error a servicio de monitoreo (si está configurado)
        if (typeof window.errorReporting === 'function') {
            window.errorReporting.captureException(event.error || event.reason);
        }
        
        // Mostrar mensaje amigable al usuario en casos críticos
        if (!this.isInitialized) {
            this.showErrorMessage('Ha ocurrido un error al cargar la aplicación. Por favor, recarga la página.');
        }
    }

    /**
     * Muestra mensaje de error al usuario
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">⚠️</span>
                <span class="flex-1">${message}</span>
                <button class="ml-4 text-white hover:text-gray-200 text-xl" onclick="this.parentElement.parentElement.remove()">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * API pública para interactuar con componentes
     */
    getComponent(name) {
        return this.components[name];
    }

    /**
     * Refresca todos los componentes dinámicos
     */
    refreshComponents() {
        Object.values(this.components).forEach(component => {
            if (typeof component.refresh === 'function') {
                component.refresh();
            }
        });
    }

    /**
     * Destruye la aplicación y limpia recursos
     */
    destroy() {
        try {
            // Destruir componentes
            Object.values(this.components).forEach(component => {
                if (typeof component.destroy === 'function') {
                    component.destroy();
                }
            });
            
            // Limpiar referencias
            this.components = {};
            this.isInitialized = false;
            
            // Remover event listeners
            window.removeEventListener('error', this.handleError);
            window.removeEventListener('unhandledrejection', this.handleError);
            
            console.log('🧹 Pan & Oro App destruida correctamente');
            
        } catch (error) {
            console.error('Error al destruir la aplicación:', error);
        }
    }
}

// Crear instancia global
const panOroApp = new PanOroApp();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => panOroApp.init());
} else {
    panOroApp.init();
}

// Exportar para uso global
window.PanOroApp = panOroApp;

// Hot Module Replacement para desarrollo
if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
        panOroApp.destroy();
    });
}