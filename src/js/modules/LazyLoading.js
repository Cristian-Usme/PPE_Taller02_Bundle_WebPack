/**
 * Módulo LazyLoading - Carga perezosa de imágenes y contenido
 */
export class LazyLoading {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.01,
            imageSelector: 'img[loading="lazy"], img[data-src]',
            backgroundSelector: '[data-bg]',
            contentSelector: '[data-lazy]',
            loadingClass: 'lazy-loading',
            loadedClass: 'lazy-loaded',
            errorClass: 'lazy-error',
            fadeInDuration: 300,
            enableNativeLoading: true,
            retryAttempts: 2,
            retryDelay: 1000,
            ...options
        };
        
        this.observer = null;
        this.images = [];
        this.backgrounds = [];
        this.content = [];
        this.loadAttempts = new Map();
        
        // Bind methods
        this.handleIntersection = this.handleIntersection.bind(this);
        this.loadImage = this.loadImage.bind(this);
        this.loadBackground = this.loadBackground.bind(this);
        this.loadContent = this.loadContent.bind(this);
    }

    /**
     * Inicializa el lazy loading
     */
    async init() {
        try {
            // Verificar soporte para Intersection Observer
            if (!('IntersectionObserver' in window)) {
                console.warn('IntersectionObserver no soportado, cargando todo inmediatamente');
                await this.loadAllImmediately();
                return;
            }
            
            // Verificar soporte para loading nativo
            if (this.options.enableNativeLoading && 'loading' in HTMLImageElement.prototype) {
                console.log('🚀 Usando loading nativo del navegador');
                this.setupNativeLoading();
            }
            
            this.setupObserver();
            this.collectElements();
            this.observeElements();
            
            console.log(`✅ LazyLoading inicializado con ${this.getTotalElements()} elementos`);
            
        } catch (error) {
            console.error('Error inicializando LazyLoading:', error);
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
     * Configura loading nativo para imágenes compatibles
     */
    setupNativeLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        let nativeCount = 0;
        
        images.forEach(img => {
            // Solo usar loading nativo si no tiene data-src (lazy loading personalizado)
            if (!img.dataset.src && img.loading === 'lazy') {
                nativeCount++;
            }
        });
        
        console.log(`📱 ${nativeCount} imágenes usando loading="lazy" nativo`);
    }

    /**
     * Recopila todos los elementos a observar
     */
    collectElements() {
        // Imágenes
        this.images = Array.from(document.querySelectorAll(this.options.imageSelector))
            .filter(img => {
                // Excluir imágenes que ya están cargadas o usan loading nativo sin data-src
                if (img.complete && img.naturalWidth > 0) return false;
                if (img.loading === 'lazy' && !img.dataset.src && this.options.enableNativeLoading) return false;
                return true;
            });
        
        // Fondos
        this.backgrounds = Array.from(document.querySelectorAll(this.options.backgroundSelector));
        
        // Contenido lazy
        this.content = Array.from(document.querySelectorAll(this.options.contentSelector));
    }

    /**
     * Observa todos los elementos recopilados
     */
    observeElements() {
        [...this.images, ...this.backgrounds, ...this.content].forEach(element => {
            this.observer.observe(element);
            element.classList.add(this.options.loadingClass);
        });
    }

    /**
     * Maneja las intersecciones
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadElement(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    /**
     * Carga un elemento específico
     */
    async loadElement(element) {
        try {
            if (element.tagName === 'IMG') {
                await this.loadImage(element);
            } else if (element.dataset.bg) {
                await this.loadBackground(element);
            } else if (element.dataset.lazy) {
                await this.loadContent(element);
            }
        } catch (error) {
            console.error('Error cargando elemento lazy:', error);
            this.handleLoadError(element, error);
        }
    }

    /**
     * Carga una imagen
     */
    async loadImage(img) {
        return new Promise((resolve, reject) => {
            const src = img.dataset.src || img.src;
            
            if (!src) {
                reject(new Error('No se encontró src para la imagen'));
                return;
            }
            
            // Crear nueva imagen para precargar
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                // Aplicar la imagen cargada
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                }
                
                // Aplicar srcset si existe
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    delete img.dataset.srcset;
                }
                
                // Aplicar sizes si existe
                if (img.dataset.sizes) {
                    img.sizes = img.dataset.sizes;
                    delete img.dataset.sizes;
                }
                
                this.onElementLoaded(img);
                resolve(img);
            };
            
            imageLoader.onerror = () => {
                const error = new Error(`Error cargando imagen: ${src}`);
                this.handleLoadError(img, error);
                reject(error);
            };
            
            // Iniciar carga
            imageLoader.src = src;
            
            // Copiar srcset si existe
            if (img.dataset.srcset) {
                imageLoader.srcset = img.dataset.srcset;
            }
        });
    }

    /**
     * Carga un fondo
     */
    async loadBackground(element) {
        return new Promise((resolve, reject) => {
            const bgUrl = element.dataset.bg;
            
            if (!bgUrl) {
                reject(new Error('No se encontró data-bg'));
                return;
            }
            
            // Crear imagen para precargar el fondo
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                element.style.backgroundImage = `url(${bgUrl})`;
                delete element.dataset.bg;
                
                this.onElementLoaded(element);
                resolve(element);
            };
            
            imageLoader.onerror = () => {
                const error = new Error(`Error cargando fondo: ${bgUrl}`);
                this.handleLoadError(element, error);
                reject(error);
            };
            
            imageLoader.src = bgUrl;
        });
    }

    /**
     * Carga contenido lazy
     */
    async loadContent(element) {
        return new Promise((resolve, reject) => {
            const contentUrl = element.dataset.lazy;
            
            if (!contentUrl) {
                // Si no hay URL, solo marcar como cargado (para efectos de animación)
                this.onElementLoaded(element);
                resolve(element);
                return;
            }
            
            // Cargar contenido vía fetch
            fetch(contentUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(html => {
                    element.innerHTML = html;
                    delete element.dataset.lazy;
                    
                    // Re-procesar elementos lazy dentro del contenido cargado
                    this.processNewContent(element);
                    
                    this.onElementLoaded(element);
                    resolve(element);
                })
                .catch(error => {
                    this.handleLoadError(element, error);
                    reject(error);
                });
        });
    }

    /**
     * Procesa nuevo contenido que puede contener elementos lazy
     */
    processNewContent(container) {
        const newImages = container.querySelectorAll(this.options.imageSelector);
        const newBackgrounds = container.querySelectorAll(this.options.backgroundSelector);
        const newContent = container.querySelectorAll(this.options.contentSelector);
        
        [...newImages, ...newBackgrounds, ...newContent].forEach(element => {
            if (!element.classList.contains(this.options.loadingClass)) {
                this.observer.observe(element);
                element.classList.add(this.options.loadingClass);
            }
        });
    }

    /**
     * Se ejecuta cuando un elemento se carga exitosamente
     */
    onElementLoaded(element) {
        element.classList.remove(this.options.loadingClass);
        element.classList.add(this.options.loadedClass);
        
        // Animación fade in
        if (this.options.fadeInDuration > 0) {
            element.style.opacity = '0';
            element.style.transition = `opacity ${this.options.fadeInDuration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
            
            // Limpiar estilos después de la animación
            setTimeout(() => {
                element.style.opacity = '';
                element.style.transition = '';
            }, this.options.fadeInDuration + 50);
        }
        
        // Trigger custom event
        element.dispatchEvent(new CustomEvent('lazyLoaded', {
            detail: { element }
        }));
    }

    /**
     * Maneja errores de carga
     */
    handleLoadError(element, error) {
        console.warn(`Error en lazy loading:`, error);
        
        // Contar intentos
        const attemptKey = element.src || element.dataset.src || element.dataset.bg;
        const attempts = this.loadAttempts.get(attemptKey) || 0;
        
        if (attempts < this.options.retryAttempts) {
            // Reintentar después del delay
            this.loadAttempts.set(attemptKey, attempts + 1);
            
            setTimeout(() => {
                this.loadElement(element);
            }, this.options.retryDelay * (attempts + 1));
            
            return;
        }
        
        // Sin más reintentos - marcar como error
        element.classList.remove(this.options.loadingClass);
        element.classList.add(this.options.errorClass);
        
        // Para imágenes, usar imagen placeholder si está disponible
        if (element.tagName === 'IMG' && element.dataset.placeholder) {
            element.src = element.dataset.placeholder;
        }
        
        // Trigger custom event
        element.dispatchEvent(new CustomEvent('lazyError', {
            detail: { element, error, attempts: attempts + 1 }
        }));
    }

    /**
     * Carga todos los elementos inmediatamente (fallback)
     */
    async loadAllImmediately() {
        this.collectElements();
        
        const loadPromises = [
            ...this.images.map(img => this.loadImage(img).catch(() => {})),
            ...this.backgrounds.map(bg => this.loadBackground(bg).catch(() => {})),
            ...this.content.map(content => this.loadContent(content).catch(() => {}))
        ];
        
        await Promise.allSettled(loadPromises);
        console.log('📦 Todos los elementos lazy cargados inmediatamente');
    }

    /**
     * Fuerza la carga de un elemento específico
     */
    loadNow(element) {
        if (this.observer) {
            this.observer.unobserve(element);
        }
        return this.loadElement(element);
    }

    /**
     * Fuerza la carga de todos los elementos pendientes
     */
    async loadAll() {
        const pendingElements = [
            ...this.images.filter(img => img.classList.contains(this.options.loadingClass)),
            ...this.backgrounds.filter(bg => bg.classList.contains(this.options.loadingClass)),
            ...this.content.filter(content => content.classList.contains(this.options.loadingClass))
        ];
        
        const loadPromises = pendingElements.map(element => {
            if (this.observer) {
                this.observer.unobserve(element);
            }
            return this.loadElement(element).catch(() => {});
        });
        
        await Promise.allSettled(loadPromises);
        console.log(`⚡ ${pendingElements.length} elementos lazy cargados forzadamente`);
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
        this.observeElements();
        
        console.log(`🔄 LazyLoading actualizado con ${this.getTotalElements()} elementos`);
    }

    /**
     * Obtiene el total de elementos a procesar
     */
    getTotalElements() {
        return this.images.length + this.backgrounds.length + this.content.length;
    }

    /**
     * Obtiene estadísticas de carga
     */
    getStats() {
        const total = this.getTotalElements();
        const loaded = document.querySelectorAll(`.${this.options.loadedClass}`).length;
        const errors = document.querySelectorAll(`.${this.options.errorClass}`).length;
        const pending = document.querySelectorAll(`.${this.options.loadingClass}`).length;
        
        return {
            total,
            loaded,
            errors,
            pending,
            loadedPercentage: total > 0 ? Math.round((loaded / total) * 100) : 100
        };
    }

    /**
     * Destruye el lazy loading
     */
    destroy() {
        // Desconectar observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Limpiar clases de todos los elementos
        document.querySelectorAll(`.${this.options.loadingClass}, .${this.options.loadedClass}, .${this.options.errorClass}`).forEach(element => {
            element.classList.remove(this.options.loadingClass, this.options.loadedClass, this.options.errorClass);
            element.style.opacity = '';
            element.style.transition = '';
        });
        
        // Limpiar referencias
        this.images = [];
        this.backgrounds = [];
        this.content = [];
        this.loadAttempts.clear();
        
        console.log('🧹 LazyLoading destruido');
    }
}