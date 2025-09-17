
export class WhatsAppButton {
    constructor(buttonElement, options = {}) {
        this.button = buttonElement;
        this.options = {
            phoneNumber: '+573001112233',
            message: '¡Hola! Me interesa conocer más sobre Pan & Oro',
            position: 'bottom-right',
            showTooltip: true,
            animateOnScroll: true,
            hideOnMobile: false,
            ...options
        };
        
        this.isVisible = true;
        this.lastScrollY = 0;
        this.tooltip = null;
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    /**
     * Inicializa el botón de WhatsApp
     */
    async init() {
        try {
            this.setupButton();
            this.setupTooltip();
            this.setupEventListeners();
            this.setupAccessibility();
            this.handleResponsive();
            
            console.log('✅ WhatsAppButton inicializado correctamente');
            
        } catch (error) {
            console.error('Error inicializando WhatsAppButton:', error);
            throw error;
        }
    }

    /**
     * Configura el botón
     */
    setupButton() {
        // Asegurar clases CSS
        if (!this.button.classList.contains('floating-btn')) {
            this.button.classList.add('floating-btn');
        }
        
        // Agregar clases adicionales basadas en opciones
        this.button.classList.add(`floating-btn--${this.options.position}`);
        
        // Asegurar que tenga el ícono de WhatsApp
        if (!this.button.querySelector('svg')) {
            this.button.innerHTML = `
                <svg class="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
            `;
        }
    }

    /**
     * Configura el tooltip
     */
    setupTooltip() {
        if (!this.options.showTooltip) return;
        
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'whatsapp-tooltip absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none transition-all duration-200 whitespace-nowrap';
        this.tooltip.textContent = 'Chatea con nosotros';
        
        // Agregar flecha
        const arrow = document.createElement('div');
        arrow.className = 'absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
        this.tooltip.appendChild(arrow);
        
        // Insertar tooltip
        this.button.style.position = 'relative';
        this.button.appendChild(this.tooltip);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Click para abrir WhatsApp
        this.button.addEventListener('click', this.handleClick);
        
        // Hover para tooltip
        if (this.options.showTooltip) {
            this.button.addEventListener('mouseenter', this.showTooltip);
            this.button.addEventListener('mouseleave', this.hideTooltip);
        }
        
        // Scroll animation
        if (this.options.animateOnScroll) {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.handleResponsive();
        });
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        this.button.setAttribute('aria-label', 'Contactar por WhatsApp');
        this.button.setAttribute('role', 'button');
        this.button.setAttribute('title', 'Chatea con nosotros en WhatsApp');
        
        // Keyboard support
        this.button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.handleClick();
            }
        });
        
        // Asegurar que sea focusable
        if (!this.button.hasAttribute('tabindex')) {
            this.button.setAttribute('tabindex', '0');
        }
    }

    /**
     * Maneja responsive
     */
    handleResponsive() {
        if (this.options.hideOnMobile && window.innerWidth < 768) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Maneja el click en el botón
     */
    handleClick() {
        const phoneNumber = this.options.phoneNumber.replace(/[^\d+]/g, '');
        const message = encodeURIComponent(this.options.message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        // Animación de click
        this.button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.button.style.transform = '';
        }, 150);
        
        // Analytics/tracking (si está configurado)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'contact',
                event_label: 'whatsapp_button'
            });
        }
        
        // Trigger custom event
        this.button.dispatchEvent(new CustomEvent('whatsapp:clicked', {
            detail: { phoneNumber: this.options.phoneNumber, message: this.options.message }
        }));
    }

    /**
     * Maneja el scroll para animaciones
     */
    handleScroll() {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > this.lastScrollY;
        const scrollDistance = Math.abs(currentScrollY - this.lastScrollY);
        
        // Solo animar si el scroll es significativo
        if (scrollDistance < 10) return;
        
        // Animación basada en dirección del scroll
        if (scrollingDown && currentScrollY > 200) {
            // Scrolling down - esconder ligeramente
            this.button.style.transform = 'translateY(10px) scale(0.9)';
            this.button.style.opacity = '0.7';
        } else {
            // Scrolling up o en top - mostrar completamente
            this.button.style.transform = 'translateY(0) scale(1)';
            this.button.style.opacity = '1';
        }
        
        this.lastScrollY = currentScrollY;
    }

    /**
     * Muestra el tooltip
     */
    showTooltip() {
        if (!this.tooltip) return;
        
        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = 'translateY(-5px)';
        this.tooltip.style.pointerEvents = 'auto';
    }

    /**
     * Oculta el tooltip
     */
    hideTooltip() {
        if (!this.tooltip) return;
        
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'translateY(0)';
        this.tooltip.style.pointerEvents = 'none';
    }

    /**
     * Muestra el botón
     */
    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.button.style.display = 'flex';
        
        // Animación de entrada
        requestAnimationFrame(() => {
            this.button.style.opacity = '1';
            this.button.style.transform = 'scale(1)';
        });
    }

    /**
     * Oculta el botón
     */
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.button.style.opacity = '0';
        this.button.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            if (!this.isVisible) {
                this.button.style.display = 'none';
            }
        }, 200);
    }

    /**
     * Actualiza la configuración
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // Re-setup si es necesario
        if (newOptions.showTooltip !== undefined) {
            if (newOptions.showTooltip && !this.tooltip) {
                this.setupTooltip();
            } else if (!newOptions.showTooltip && this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
        }
    }

    /**
     * Actualiza el número de teléfono
     */
    updatePhoneNumber(phoneNumber) {
        this.options.phoneNumber = phoneNumber;
    }

    /**
     * Actualiza el mensaje
     */
    updateMessage(message) {
        this.options.message = message;
    }

    /**
     * Reproduce una animación de pulso (para llamar la atención)
     */
    pulse() {
        this.button.classList.add('animate-pulse');
        setTimeout(() => {
            this.button.classList.remove('animate-pulse');
        }, 2000);
    }

    /**
     * Reproduce una animación de rebote
     */
    bounce() {
        this.button.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
            this.button.style.animation = '';
        }, 600);
    }

    /**
     * Destruye el botón de WhatsApp
     */
    destroy() {
        // Remover event listeners
        this.button.removeEventListener('click', this.handleClick);
        
        if (this.options.showTooltip) {
            this.button.removeEventListener('mouseenter', this.showTooltip);
            this.button.removeEventListener('mouseleave', this.hideTooltip);
        }
        
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResponsive);
        
        // Remover tooltip
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        
        // Limpiar estilos
        this.button.style.transform = '';
        this.button.style.opacity = '';
        this.button.style.animation = '';
        
        // Remover atributos de accesibilidad
        this.button.removeAttribute('aria-label');
        this.button.removeAttribute('role');
        this.button.removeAttribute('title');
    }
}