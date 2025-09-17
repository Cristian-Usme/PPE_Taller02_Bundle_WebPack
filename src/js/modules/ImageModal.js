
export class ImageModal {
    constructor(options = {}) {
        this.options = {
            modalSelector: '#imageModal',
            imageSelector: '#modalImage',
            closeSelector: '#closeModal',
            triggerSelector: '.gallery-item img',
            showNavigationArrows: true,
            enableKeyboardNavigation: true,
            enableSwipeGestures: true,
            animationDuration: 300,
            ...options
        };
        
        this.isOpen = false;
        this.currentImageIndex = 0;
        this.images = [];
        this.modal = null;
        this.modalImage = null;
        this.closeButton = null;
        this.prevButton = null;
        this.nextButton = null;
        
        // Touch handling
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        // Bind methods
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.nextImage = this.nextImage.bind(this);
        this.prevImage = this.prevImage.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleImageClick = this.handleImageClick.bind(this);
    }

    /**
     * Inicializa el modal de imágenes
     */
    async init() {
        try {
            this.createModalElements();
            this.collectImages();
            this.setupEventListeners();
            this.setupAccessibility();
            
            console.log(`✅ ImageModal inicializado con ${this.images.length} imágenes`);
            
        } catch (error) {
            console.error('Error inicializando ImageModal:', error);
            throw error;
        }
    }

    /**
     * Crea los elementos del modal si no existen
     */
    createModalElements() {
        // Buscar modal existente
        this.modal = document.querySelector(this.options.modalSelector);
        
        if (!this.modal) {
            // Crear modal
            this.modal = document.createElement('div');
            this.modal.id = 'imageModal';
            this.modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden opacity-0 transition-opacity duration-300';
            this.modal.innerHTML = `
                <div class="relative max-w-4xl max-h-full p-4 w-full">
                    <button id="closeModal" class="absolute top-2 right-2 text-white text-3xl hover:text-gray-300 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" aria-label="Cerrar modal">
                        &times;
                    </button>
                    <img id="modalImage" src="" alt="" class="max-w-full max-h-full object-contain rounded-lg mx-auto block">
                    <div class="absolute inset-y-0 left-0 flex items-center">
                        <button id="prevImage" class="text-white text-2xl hover:text-gray-300 p-2 ml-4 rounded-full hover:bg-white/20 transition-colors" aria-label="Imagen anterior">
                            &#10094;
                        </button>
                    </div>
                    <div class="absolute inset-y-0 right-0 flex items-center">
                        <button id="nextImage" class="text-white text-2xl hover:text-gray-300 p-2 mr-4 rounded-full hover:bg-white/20 transition-colors" aria-label="Siguiente imagen">
                            &#10095;
                        </button>
                    </div>
                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        <div id="imageCounter" class="text-white bg-black/50 px-3 py-1 rounded-full text-sm"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.modal);
        }
        
        // Obtener referencias a elementos
        this.modalImage = this.modal.querySelector(this.options.imageSelector);
        this.closeButton = this.modal.querySelector(this.options.closeSelector);
        this.prevButton = this.modal.querySelector('#prevImage');
        this.nextButton = this.modal.querySelector('#nextImage');
        this.imageCounter = this.modal.querySelector('#imageCounter');
    }

    /**
     * Recopila todas las imágenes de la galería
     */
    collectImages() {
        const imageElements = document.querySelectorAll(this.options.triggerSelector);
        
        this.images = Array.from(imageElements).map((img, index) => ({
            src: img.src,
            alt: img.alt || `Imagen ${index + 1}`,
            element: img
        }));
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Click en imágenes de la galería
        this.images.forEach((image, index) => {
            image.element.addEventListener('click', () => this.handleImageClick(index));
            image.element.style.cursor = 'pointer';
        });
        
        // Botones del modal
        if (this.closeButton) {
            this.closeButton.addEventListener('click', this.close);
        }
        
        if (this.prevButton && this.options.showNavigationArrows) {
            this.prevButton.addEventListener('click', this.prevImage);
        }
        
        if (this.nextButton && this.options.showNavigationArrows) {
            this.nextButton.addEventListener('click', this.nextImage);
        }
        
        // Click fuera del modal para cerrar
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
        
        // Teclado
        if (this.options.enableKeyboardNavigation) {
            document.addEventListener('keydown', this.handleKeydown);
        }
        
        // Touch/Swipe gestures
        if (this.options.enableSwipeGestures) {
            this.modalImage.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            this.modalImage.addEventListener('touchmove', this.handleTouchMove, { passive: true });
            this.modalImage.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        }
        
        // Prevenir scroll del body cuando el modal está abierto
        this.modal.addEventListener('wheel', (event) => {
            if (this.isOpen) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.setAttribute('aria-labelledby', 'modal-title');
        
        // Crear título oculto para screen readers
        const title = document.createElement('h2');
        title.id = 'modal-title';
        title.className = 'sr-only';
        title.textContent = 'Visualizador de imágenes';
        this.modal.appendChild(title);
    }

    /**
     * Maneja click en imagen de la galería
     */
    handleImageClick(index) {
        this.currentImageIndex = index;
        this.open();
    }

    /**
     * Abre el modal
     */
    open() {
        if (this.isOpen || this.images.length === 0) return;
        
        this.isOpen = true;
        
        // Mostrar modal
        this.modal.classList.remove('hidden');
        this.modal.setAttribute('aria-hidden', 'false');
        
        // Cargar imagen
        this.loadCurrentImage();
        
        // Animación de entrada
        requestAnimationFrame(() => {
            this.modal.classList.remove('opacity-0');
            this.modal.classList.add('opacity-100');
        });
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        // Focus en el botón de cerrar
        if (this.closeButton) {
            this.closeButton.focus();
        }
        
        // Mostrar/ocultar controles de navegación
        this.updateNavigationVisibility();
        
        // Trigger custom event
        this.modal.dispatchEvent(new CustomEvent('imageModal:opened', {
            detail: { imageIndex: this.currentImageIndex }
        }));
    }

    /**
     * Cierra el modal
     */
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Animación de salida
        this.modal.classList.remove('opacity-100');
        this.modal.classList.add('opacity-0');
        
        setTimeout(() => {
            if (!this.isOpen) {
                this.modal.classList.add('hidden');
                this.modal.setAttribute('aria-hidden', 'true');
            }
        }, this.options.animationDuration);
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Devolver focus a la imagen original
        const originalImage = this.images[this.currentImageIndex]?.element;
        if (originalImage) {
            originalImage.focus();
        }
        
        // Trigger custom event
        this.modal.dispatchEvent(new CustomEvent('imageModal:closed', {
            detail: { imageIndex: this.currentImageIndex }
        }));
    }

    /**
     * Navega a la siguiente imagen
     */
    nextImage() {
        if (this.images.length <= 1) return;
        
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.loadCurrentImage();
        this.updateNavigationVisibility();
    }

    /**
     * Navega a la imagen anterior
     */
    prevImage() {
        if (this.images.length <= 1) return;
        
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.loadCurrentImage();
        this.updateNavigationVisibility();
    }

    /**
     * Carga la imagen actual
     */
    loadCurrentImage() {
        const currentImage = this.images[this.currentImageIndex];
        if (!currentImage) return;
        
        // Mostrar loading
        this.modalImage.style.opacity = '0.5';
        
        // Crear nueva imagen para precargar
        const img = new Image();
        img.onload = () => {
            this.modalImage.src = currentImage.src;
            this.modalImage.alt = currentImage.alt;
            this.modalImage.style.opacity = '1';
            this.updateImageCounter();
        };
        
        img.onerror = () => {
            console.error(`Error cargando imagen: ${currentImage.src}`);
            this.modalImage.style.opacity = '1';
        };
        
        img.src = currentImage.src;
    }

    /**
     * Actualiza el contador de imágenes
     */
    updateImageCounter() {
        if (this.imageCounter) {
            this.imageCounter.textContent = `${this.currentImageIndex + 1} de ${this.images.length}`;
        }
    }

    /**
     * Actualiza la visibilidad de los controles de navegación
     */
    updateNavigationVisibility() {
        const showNavigation = this.images.length > 1;
        
        if (this.prevButton) {
            this.prevButton.style.display = showNavigation ? 'flex' : 'none';
        }
        
        if (this.nextButton) {
            this.nextButton.style.display = showNavigation ? 'flex' : 'none';
        }
    }

    /**
     * Maneja navegación por teclado
     */
    handleKeydown(event) {
        if (!this.isOpen) return;
        
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                this.prevImage();
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                this.nextImage();
                break;
                
            case 'Home':
                event.preventDefault();
                this.currentImageIndex = 0;
                this.loadCurrentImage();
                this.updateNavigationVisibility();
                break;
                
            case 'End':
                event.preventDefault();
                this.currentImageIndex = this.images.length - 1;
                this.loadCurrentImage();
                this.updateNavigationVisibility();
                break;
        }
    }

    /**
     * Maneja inicio de touch
     */
    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    /**
     * Maneja movimiento de touch
     */
    handleTouchMove(event) {
        // Prevenir scroll mientras se hace swipe
        const touchMoveX = event.touches[0].clientX;
        const touchMoveY = event.touches[0].clientY;
        
        const deltaX = Math.abs(touchMoveX - this.touchStartX);
        const deltaY = Math.abs(touchMoveY - this.touchStartY);
        
        // Si el movimiento es más horizontal que vertical, prevenir scroll
        if (deltaX > deltaY) {
            event.preventDefault();
        }
    }

    /**
     * Maneja final de touch
     */
    handleTouchEnd(event) {
        this.touchEndX = event.changedTouches[0].clientX;
        this.touchEndY = event.changedTouches[0].clientY;
        this.handleSwipe();
    }

    /**
     * Maneja gestos de swipe
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const deltaX = this.touchStartX - this.touchEndX;
        const deltaY = Math.abs(this.touchStartY - this.touchEndY);
        
        // Solo procesar swipes horizontales
        if (deltaY > swipeThreshold) return;
        
        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) {
                // Swipe left - siguiente imagen
                this.nextImage();
            } else {
                // Swipe right - imagen anterior
                this.prevImage();
            }
        }
    }

    /**
     * Actualiza la colección de imágenes
     */
    updateImages() {
        this.collectImages();
        console.log(`🔄 ImageModal actualizado con ${this.images.length} imágenes`);
    }

    /**
     * Destruye el modal de imágenes
     */
    destroy() {
        // Cerrar modal si está abierto
        if (this.isOpen) {
            this.close();
        }
        
        // Remover event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        
        this.images.forEach(image => {
            image.element.removeEventListener('click', this.handleImageClick);
            image.element.style.cursor = '';
        });
        
        if (this.closeButton) {
            this.closeButton.removeEventListener('click', this.close);
        }
        
        if (this.prevButton) {
            this.prevButton.removeEventListener('click', this.prevImage);
        }
        
        if (this.nextButton) {
            this.nextButton.removeEventListener('click', this.nextImage);
        }
        
        // Remover modal del DOM si fue creado dinámicamente
        if (this.modal && this.modal.parentNode) {
            this.modal.remove();
        }
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Limpiar referencias
        this.images = [];
        this.modal = null;
        this.modalImage = null;
        this.closeButton = null;
        this.prevButton = null;
        this.nextButton = null;
    }
}