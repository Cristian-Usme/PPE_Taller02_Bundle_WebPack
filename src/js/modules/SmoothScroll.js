/**
 * Módulo SmoothScroll - Navegación suave y offset para header fijo
 */
export class SmoothScroll {
    constructor(options = {}) {
        this.options = {
            offset: 80, // Offset para header fijo
            duration: 800,
            easing: 'easeInOutCubic',
            updateHash: true,
            linkSelector: 'a[href*="#"]:not([href="#"])',
            excludeSelector: '[data-no-smooth]',
            ...options
        };
        
        this.isScrolling = false;
        this.links = [];
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.scrollToTarget = this.scrollToTarget.bind(this);
    }

    /**
     * Inicializa el smooth scroll
     */
    async init() {
        try {
            this.collectLinks();
            this.setupEventListeners();
            this.handleInitialHash();
            
            console.log(`✅ SmoothScroll inicializado con ${this.links.length} enlaces`);
            
        } catch (error) {
            console.error('Error inicializando SmoothScroll:', error);
            throw error;
        }
    }

    /**
     * Recopila todos los enlaces internos
     */
    collectLinks() {
        const linkElements = document.querySelectorAll(this.options.linkSelector);
        
        this.links = Array.from(linkElements).filter(link => {
            // Excluir enlaces marcados
            if (link.matches(this.options.excludeSelector)) {
                return false;
            }
            
            // Solo enlaces internos de la misma página
            const href = link.getAttribute('href');
            if (!href || !href.includes('#')) return false;
            
            // Verificar que el target existe
            const targetId = href.split('#')[1];
            if (!targetId) return false;
            
            const target = document.getElementById(targetId);
            return target !== null;
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        this.links.forEach(link => {
            link.addEventListener('click', this.handleClick);
        });
        
        // Escuchar cambios en el hash
        window.addEventListener('hashchange', () => {
            if (!this.isScrolling) {
                this.scrollToCurrentHash();
            }
        });
        
        // Actualizar colección de enlaces dinámicamente
        const observer = new MutationObserver(() => {
            this.updateLinks();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Maneja clicks en enlaces
     */
    handleClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        // Obtener el ID del target
        const targetId = href.split('#')[1];
        if (!targetId) return;
        
        const target = document.getElementById(targetId);
        if (!target) return;
        
        // Prevenir comportamiento default
        event.preventDefault();
        
        // Realizar scroll suave
        this.scrollToTarget(target, targetId);
    }

    /**
     * Realiza scroll suave a un elemento
     */
    scrollToTarget(target, targetId = null) {
        if (this.isScrolling) return;
        
        const targetPosition = this.getTargetPosition(target);
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        
        if (Math.abs(distance) < 10) return; // Ya estamos cerca
        
        this.isScrolling = true;
        
        // Animación de scroll
        this.animateScroll(startPosition, distance, targetId);
    }

    /**
     * Obtiene la posición objetivo considerando el offset
     */
    getTargetPosition(target) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        return Math.round(rect.top + scrollTop - this.options.offset);
    }

    /**
     * Anima el scroll
     */
    animateScroll(startPosition, distance, targetId) {
        let startTime = null;
        const duration = this.options.duration;
        
        const animateFrame = (currentTime) => {
            if (startTime === null) {
                startTime = currentTime;
            }
            
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Aplicar easing
            const easedProgress = this.easing(progress);
            const currentPosition = startPosition + (distance * easedProgress);
            
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                this.onScrollComplete(targetId);
            }
        };
        
        requestAnimationFrame(animateFrame);
    }

    /**
     * Función de easing
     */
    easing(t) {
        switch (this.options.easing) {
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            case 'easeOutQuart':
                return 1 - (--t) * t * t * t;
            case 'easeInOutQuart':
                return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
            case 'linear':
            default:
                return t;
        }
    }

    /**
     * Se ejecuta cuando el scroll se completa
     */
    onScrollComplete(targetId) {
        this.isScrolling = false;
        
        // Actualizar hash si está habilitado
        if (this.options.updateHash && targetId) {
            history.replaceState(null, null, `#${targetId}`);
        }
        
        // Focus en el target para accesibilidad
        const target = document.getElementById(targetId);
        if (target) {
            // Solo enfocar si el elemento es focusable naturalmente
            if (target.tabIndex >= 0 || target.matches('a, button, input, textarea, select, details, [contenteditable]')) {
                target.focus();
            } else {
                // Hacer temporalmente focusable
                target.setAttribute('tabindex', '-1');
                target.focus();
                target.addEventListener('blur', () => {
                    target.removeAttribute('tabindex');
                }, { once: true });
            }
        }
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('smoothScroll:complete', {
            detail: { targetId, target }
        }));
    }

    /**
     * Maneja el hash inicial al cargar la página
     */
    handleInitialHash() {
        if (window.location.hash) {
            // Pequeño delay para asegurar que la página esté completamente cargada
            setTimeout(() => {
                this.scrollToCurrentHash();
            }, 100);
        }
    }

    /**
     * Hace scroll al hash actual
     */
    scrollToCurrentHash() {
        const hash = window.location.hash;
        if (!hash) return;
        
        const targetId = hash.substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
            this.scrollToTarget(target, targetId);
        }
    }

    /**
     * Actualiza la colección de enlaces
     */
    updateLinks() {
        // Remover listeners de enlaces anteriores
        this.links.forEach(link => {
            link.removeEventListener('click', this.handleClick);
        });
        
        // Recolectar nuevos enlaces
        this.collectLinks();
        
        // Agregar listeners a nuevos enlaces
        this.links.forEach(link => {
            link.addEventListener('click', this.handleClick);
        });
    }

    /**
     * Scroll a un elemento específico (API pública)
     */
    scrollTo(selector) {
        const target = typeof selector === 'string' 
            ? document.querySelector(selector)
            : selector;
        
        if (!target) {
            console.warn(`SmoothScroll: Target not found: ${selector}`);
            return;
        }
        
        const targetId = target.id || null;
        this.scrollToTarget(target, targetId);
    }

    /**
     * Scroll al top de la página
     */
    scrollToTop() {
        if (this.isScrolling) return;
        
        const startPosition = window.pageYOffset;
        const distance = -startPosition;
        
        this.isScrolling = true;
        this.animateScroll(startPosition, distance, null);
    }

    /**
     * Actualiza el offset (útil para headers dinámicos)
     */
    updateOffset(newOffset) {
        this.options.offset = newOffset;
    }

    /**
     * Habilita/deshabilita la actualización del hash
     */
    setUpdateHash(enabled) {
        this.options.updateHash = enabled;
    }

    /**
     * Destruye el smooth scroll
     */
    destroy() {
        // Remover event listeners
        this.links.forEach(link => {
            link.removeEventListener('click', this.handleClick);
        });
        
        // Limpiar referencias
        this.links = [];
        this.isScrolling = false;
    }
}