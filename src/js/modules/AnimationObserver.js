/**
 * Módulo AnimationObserver - Animaciones basadas en scroll y visibilidad
 */
export class AnimationObserver {
    constructor(options = {}) {
        this.options = {
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1,
            animationClass: 'fade-in',
            visibleClass: 'visible',
            animatedClass: 'animated',
            selector: '.fade-in, [data-animate]',
            animationDelay: 100,
            staggerDelay: 150,
            enableStagger: true,
            animationDuration: 600,
            once: true,
            ...options
        };
        
        this.observer = null;
        this.elements = [];
        this.animatedElements = new Set();
        
        // Bind methods
        this.handleIntersection = this.handleIntersection.bind(this);
        this.animateElement = this.animateElement.bind(this);
    }

    /**
     * Inicializa el observador de animaciones
     */
    async init() {
        try {
            if (!('IntersectionObserver' in window)) {
                console.warn('IntersectionObserver no soportado, aplicando animaciones inmediatamente');
                this.applyAllAnimations();
                return;
            }
            
            this.setupObserver();
            this.collectElements();
            this.setupInitialStates();
            this.observeElements();
            
            console.log(`✅ AnimationObserver inicializado con ${this.elements.length} elementos`);
            
        } catch (error) {
            console.error('Error inicializando AnimationObserver:', error);
            throw error;
        }
    }

    /**
     * Configura el Intersection Observer
     */
    setupObserver() {
        const options = {
            root: null,
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        };
        
        this.observer = new IntersectionObserver(this.handleIntersection, options);
    }

    /**
     * Recopila todos los elementos a animar
     */
    collectElements() {
        this.elements = Array.from(document.querySelectorAll(this.options.selector))
            .filter(element => {
                // Filtrar elementos que ya están animados si once es true
                if (this.options.once && this.animatedElements.has(element)) {
                    return false;
                }
                return true;
            });
    }

    /**
     * Configura estados iniciales de los elementos
     */
    setupInitialStates() {
        this.elements.forEach((element, index) => {
            // Agregar clase de animación si no la tiene
            if (!element.classList.contains(this.options.animationClass) && !element.dataset.animate) {
                element.classList.add(this.options.animationClass);
            }
            
            // Configurar delay para stagger si está habilitado
            if (this.options.enableStagger) {
                const delay = index * this.options.staggerDelay;
                element.style.animationDelay = `${delay}ms`;
                element.dataset.staggerIndex = index;
            }
            
            // Configurar duración de animación
            if (!element.style.animationDuration) {
                element.style.animationDuration = `${this.options.animationDuration}ms`;
            }
            
            // Marcar como no visible inicialmente
            element.classList.remove(this.options.visibleClass);
        });
    }

    /**
     * Observa todos los elementos recopilados
     */
    observeElements() {
        this.elements.forEach(element => {
            this.observer.observe(element);
        });
    }

    /**
     * Maneja las intersecciones
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.animateElement(entry.target);
                
                // Dejar de observar si once es true
                if (this.options.once) {
                    this.observer.unobserve(entry.target);
                }
            } else if (!this.options.once) {
                // Remover animación si el elemento sale de vista y once es false
                this.removeAnimation(entry.target);
            }
        });
    }

    /**
     * Anima un elemento específico
     */
    animateElement(element) {
        // Evitar animar múltiples veces si once es true
        if (this.options.once && this.animatedElements.has(element)) {
            return;
        }
        
        // Determinar tipo de animación
        const animationType = element.dataset.animate || this.getAnimationType(element);
        
        // Aplicar animación específica
        this.applyAnimation(element, animationType);
        
        // Marcar como animado
        element.classList.add(this.options.visibleClass, this.options.animatedClass);
        this.animatedElements.add(element);
        
        // Trigger custom event
        element.dispatchEvent(new CustomEvent('elementAnimated', {
            detail: { element, animationType }
        }));
    }

    /**
     * Determina el tipo de animación basado en las clases del elemento
     */
    getAnimationType(element) {
        const classList = element.classList;
        
        if (classList.contains('fade-in')) return 'fadeIn';
        if (classList.contains('slide-in-up')) return 'slideInUp';
        if (classList.contains('slide-in-down')) return 'slideInDown';
        if (classList.contains('slide-in-left')) return 'slideInLeft';
        if (classList.contains('slide-in-right')) return 'slideInRight';
        if (classList.contains('scale-in')) return 'scaleIn';
        if (classList.contains('rotate-in')) return 'rotateIn';
        if (classList.contains('bounce-in')) return 'bounceIn';
        
        return 'fadeIn'; // Default
    }

    /**
     * Aplica la animación específica
     */
    applyAnimation(element, animationType) {
        // Limpiar transformaciones previas
        element.style.transform = '';
        element.style.opacity = '';
        
        // Delay personalizado si existe
        const customDelay = element.dataset.animationDelay;
        if (customDelay) {
            element.style.animationDelay = `${customDelay}ms`;
        }
        
        // Duración personalizada si existe
        const customDuration = element.dataset.animationDuration;
        if (customDuration) {
            element.style.animationDuration = `${customDuration}ms`;
        }
        
        // Aplicar animación según tipo
        switch (animationType) {
            case 'fadeIn':
                this.fadeIn(element);
                break;
            case 'slideInUp':
                this.slideInUp(element);
                break;
            case 'slideInDown':
                this.slideInDown(element);
                break;
            case 'slideInLeft':
                this.slideInLeft(element);
                break;
            case 'slideInRight':
                this.slideInRight(element);
                break;
            case 'scaleIn':
                this.scaleIn(element);
                break;
            case 'rotateIn':
                this.rotateIn(element);
                break;
            case 'bounceIn':
                this.bounceIn(element);
                break;
            default:
                this.fadeIn(element);
        }
    }

    /**
     * Animaciones específicas
     */
    fadeIn(element) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    slideInUp(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    slideInDown(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-30px)';
        element.style.transition = `all ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    slideInLeft(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-30px)';
        element.style.transition = `all ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    slideInRight(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(30px)';
        element.style.transition = `all ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    scaleIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = `all ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    rotateIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'rotate(-10deg) scale(0.9)';
        element.style.transition = `all ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'rotate(0deg) scale(1)';
        });
    }

    bounceIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.3)';
        element.style.transition = `all ${this.options.animationDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    /**
     * Remueve la animación de un elemento
     */
    removeAnimation(element) {
        element.classList.remove(this.options.visibleClass);
        
        // Solo remover si no es 'once'
        if (!this.options.once) {
            element.classList.remove(this.options.animatedClass);
            this.animatedElements.delete(element);
            
            // Resetear estilos
            element.style.opacity = '';
            element.style.transform = '';
            element.style.transition = '';
        }
    }

    /**
     * Aplica todas las animaciones inmediatamente (fallback)
     */
    applyAllAnimations() {
        this.collectElements();
        this.elements.forEach(element => {
            this.animateElement(element);
        });
    }

    /**
     * Fuerza la animación de un elemento específico
     */
    animateNow(element) {
        if (this.observer) {
            this.observer.unobserve(element);
        }
        this.animateElement(element);
    }

    /**
     * Fuerza la animación de todos los elementos pendientes
     */
    animateAll() {
        this.elements
            .filter(element => !this.animatedElements.has(element))
            .forEach(element => {
                this.animateNow(element);
            });
    }

    /**
     * Resetea las animaciones de todos los elementos
     */
    reset() {
        this.animatedElements.clear();
        
        this.elements.forEach(element => {
            element.classList.remove(this.options.visibleClass, this.options.animatedClass);
            element.style.opacity = '';
            element.style.transform = '';
            element.style.transition = '';
            element.style.animationDelay = '';
            element.style.animationDuration = '';
            
            // Re-observar si es necesario
            if (this.observer && !this.options.once) {
                this.observer.observe(element);
            }
        });
        
        // Reconfigurar estados iniciales
        this.setupInitialStates();
    }

    /**
     * Actualiza la colección de elementos (para contenido dinámico)
     */
    refresh() {
        // Desconectar observer actual
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Recolectar elementos nuevamente
        this.collectElements();
        this.setupInitialStates();
        this.observeElements();
        
        console.log(`🔄 AnimationObserver actualizado con ${this.elements.length} elementos`);
    }

    /**
     * Agrega un nuevo elemento para animar
     */
    addElement(element) {
        if (!this.elements.includes(element)) {
            this.elements.push(element);
            this.setupInitialStates();
            
            if (this.observer) {
                this.observer.observe(element);
            }
        }
    }

    /**
     * Remueve un elemento de la observación
     */
    removeElement(element) {
        if (this.observer) {
            this.observer.unobserve(element);
        }
        
        this.elements = this.elements.filter(el => el !== element);
        this.animatedElements.delete(element);
    }

    /**
     * Obtiene estadísticas de animación
     */
    getStats() {
        return {
            totalElements: this.elements.length,
            animatedElements: this.animatedElements.size,
            pendingElements: this.elements.length - this.animatedElements.size,
            animationProgress: this.elements.length > 0 
                ? Math.round((this.animatedElements.size / this.elements.length) * 100) 
                : 100
        };
    }

    /**
     * Configura un grupo de elementos para animación en secuencia
     */
    setupSequence(selector, delay = 200) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((element, index) => {
            element.dataset.animationDelay = (index * delay).toString();
            this.addElement(element);
        });
    }

    /**
     * Pausa todas las animaciones
     */
    pause() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    /**
     * Reanuda las animaciones
     */
    resume() {
        if (this.observer) {
            this.observeElements();
        }
    }

    /**
     * Destruye el observador de animaciones
     */
    destroy() {
        // Desconectar observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Limpiar estilos de todos los elementos
        this.elements.forEach(element => {
            element.classList.remove(this.options.visibleClass, this.options.animatedClass);
            element.style.opacity = '';
            element.style.transform = '';
            element.style.transition = '';
            element.style.animationDelay = '';
            element.style.animationDuration = '';
        });
        
        // Limpiar referencias
        this.elements = [];
        this.animatedElements.clear();
        
        console.log('🧹 AnimationObserver destruido');
    }
}