
export class BannerRotator {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            autoPlay: true,
            autoPlayDelay: 5000,
            showIndicators: true,
            enableTouch: true,
            enableKeyboard: true,
            pauseOnHover: true,
            ...options
        };
        
        this.currentSlide = 0;
        this.slides = [];
        this.indicators = [];
        this.isPlaying = false;
        this.intervalId = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        // Bind methods
        this.nextSlide = this.nextSlide.bind(this);
        this.prevSlide = this.prevSlide.bind(this);
        this.goToSlide = this.goToSlide.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleKeyboard = this.handleKeyboard.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
    }

    /**
     * Inicializa el banner rotator
     */
    async init() {
        try {
            this.slides = this.container.querySelectorAll('.banner-slide');
            
            if (this.slides.length === 0) {
                console.warn('No se encontraron slides en el banner');
                return;
            }

            this.setupSlides();
            this.setupControls();
            this.setupIndicators();
            this.setupEventListeners();
            
            // Mostrar primer slide
            this.showSlide(0);
            
            // Iniciar autoplay si está habilitado
            if (this.options.autoPlay) {
                this.play();
            }
            
            console.log(`✅ BannerRotator inicializado con ${this.slides.length} slides`);
            
        } catch (error) {
            console.error('Error inicializando BannerRotator:', error);
            throw error;
        }
    }

    /**
     * Configura los slides iniciales
     */
    setupSlides() {
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');
            slide.setAttribute('data-slide-index', index);
            
            // Lazy loading para imágenes
            const img = slide.querySelector('img');
            if (img && img.dataset.src) {
                img.addEventListener('load', () => {
                    slide.classList.add('loaded');
                });
            }
        });
    }

    /**
     * Configura los controles de navegación
     */
    setupControls() {
        const prevBtn = this.container.querySelector('.banner-prev');
        const nextBtn = this.container.querySelector('.banner-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', this.prevSlide);
            prevBtn.setAttribute('aria-label', 'Imagen anterior');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', this.nextSlide);
            nextBtn.setAttribute('aria-label', 'Siguiente imagen');
        }
    }

    /**
     * Configura los indicadores
     */
    setupIndicators() {
        if (!this.options.showIndicators) return;
        
        let indicatorsContainer = this.container.querySelector('.banner-indicators');
        
        // Crear contenedor de indicadores si no existe
        if (!indicatorsContainer) {
            indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2';
            this.container.appendChild(indicatorsContainer);
        }
        
        // Limpiar indicadores existentes
        indicatorsContainer.innerHTML = '';
        
        // Crear indicadores
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'banner-indicator w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-colors duration-200';
            indicator.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
            indicator.setAttribute('data-slide', index);
            indicator.addEventListener('click', () => this.goToSlide(index));
            
            indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Touch events para móviles
        if (this.options.enableTouch) {
            this.container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            this.container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        }
        
        // Keyboard navigation
        if (this.options.enableKeyboard) {
            this.container.addEventListener('keydown', this.handleKeyboard);
            this.container.setAttribute('tabindex', '0');
        }
        
        // Pause on hover
        if (this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', this.pause);
            this.container.addEventListener('mouseleave', () => {
                if (this.options.autoPlay) this.play();
            });
        }
        
        // Intersection Observer para pausa cuando no es visible
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (this.options.autoPlay) this.play();
                    } else {
                        this.pause();
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(this.container);
        }
    }

    /**
     * Muestra un slide específico
     */
    showSlide(index) {
        // Validar índice
        if (index < 0 || index >= this.slides.length) return;
        
        // Remover clase active de todos los slides
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            slide.setAttribute('aria-hidden', i !== index);
        });
        
        // Actualizar indicadores
        this.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
            indicator.classList.toggle('bg-white', i === index);
            indicator.classList.toggle('bg-white/50', i !== index);
        });
        
        this.currentSlide = index;
        
        // Trigger custom event
        this.container.dispatchEvent(new CustomEvent('slideChanged', {
            detail: { currentSlide: index }
        }));
    }

    /**
     * Navega al siguiente slide
     */
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    /**
     * Navega al slide anterior
     */
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    /**
     * Navega a un slide específico
     */
    goToSlide(index) {
        this.showSlide(index);
    }

    /**
     * Inicia el autoplay
     */
    play() {
        if (this.isPlaying || this.slides.length <= 1) return;
        
        this.intervalId = setInterval(this.nextSlide, this.options.autoPlayDelay);
        this.isPlaying = true;
        
        // Accessibility
        this.container.setAttribute('aria-live', 'off');
    }

    /**
     * Pausa el autoplay
     */
    pause() {
        if (!this.isPlaying) return;
        
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.isPlaying = false;
        
        // Accessibility
        this.container.setAttribute('aria-live', 'polite');
    }

    /**
     * Maneja eventos touch
     */
    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
    }

    handleTouchEnd(event) {
        this.touchEndX = event.changedTouches[0].clientX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    /**
     * Maneja navegación por teclado
     */
    handleKeyboard(event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextSlide();
                break;
            case ' ': // Spacebar
                event.preventDefault();
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }
                break;
        }
    }

    /**
     * Maneja cambios de tamaño
     */
    onResize() {
        // Recalcular posiciones si es necesario
        this.showSlide(this.currentSlide);
    }

    /**
     * Destruye el banner rotator
     */
    destroy() {
        this.pause();
        
        // Remover event listeners
        const prevBtn = this.container.querySelector('.banner-prev');
        const nextBtn = this.container.querySelector('.banner-next');
        
        if (prevBtn) prevBtn.removeEventListener('click', this.prevSlide);
        if (nextBtn) nextBtn.removeEventListener('click', this.nextSlide);
        
        this.indicators.forEach(indicator => {
            indicator.removeEventListener('click', this.goToSlide);
        });
        
        this.container.removeEventListener('touchstart', this.handleTouchStart);
        this.container.removeEventListener('touchend', this.handleTouchEnd);
        this.container.removeEventListener('keydown', this.handleKeyboard);
        this.container.removeEventListener('mouseenter', this.pause);
        this.container.removeEventListener('mouseleave', this.play);
        
        // Limpiar referencias
        this.slides = [];
        this.indicators = [];
        this.currentSlide = 0;
    }
}