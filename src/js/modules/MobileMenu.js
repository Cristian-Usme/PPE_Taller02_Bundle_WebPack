/**
 * Módulo MobileMenu - Menú responsive para móviles
 */
export class MobileMenu {
    constructor(toggleButton, menuContainer, options = {}) {
        this.toggleButton = toggleButton;
        this.menuContainer = menuContainer;
        this.options = {
            animationDuration: 300,
            closeOnLinkClick: true,
            closeOnOutsideClick: true,
            trapFocus: true,
            ...options
        };
        
        this.isOpen = false;
        this.focusableElements = [];
        this.firstFocusableElement = null;
        this.lastFocusableElement = null;
        
        // Bind methods
        this.toggle = this.toggle.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    /**
     * Inicializa el menú móvil
     */
    async init() {
        try {
            this.setupAccessibility();
            this.setupEventListeners();
            this.updateFocusableElements();
            
            console.log('✅ MobileMenu inicializado correctamente');
            
        } catch (error) {
            console.error('Error inicializando MobileMenu:', error);
            throw error;
        }
    }

    /**
     * Configura atributos de accesibilidad
     */
    setupAccessibility() {
        // Toggle button
        this.toggleButton.setAttribute('aria-label', 'Abrir menú de navegación');
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.toggleButton.setAttribute('aria-controls', this.menuContainer.id || 'mobile-menu');
        
        // Menu container
        if (!this.menuContainer.id) {
            this.menuContainer.id = 'mobile-menu';
        }
        this.menuContainer.setAttribute('aria-hidden', 'true');
        this.menuContainer.setAttribute('role', 'navigation');
        this.menuContainer.setAttribute('aria-label', 'Menú de navegación móvil');
        
        // Menu links
        const links = this.menuContainer.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('tabindex', '-1');
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Toggle button
        this.toggleButton.addEventListener('click', this.toggle);
        this.toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Close on outside click
        if (this.options.closeOnOutsideClick) {
            document.addEventListener('click', this.handleOutsideClick);
        }
        
        // Close on link click
        if (this.options.closeOnLinkClick) {
            const links = this.menuContainer.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', this.handleLinkClick);
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown);
        
        // Resize handler
        window.addEventListener('resize', () => {
            // Cerrar menú en desktop
            if (window.innerWidth >= 768 && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Actualiza elementos enfocables
     */
    updateFocusableElements() {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        this.focusableElements = this.menuContainer.querySelectorAll(focusableSelectors.join(','));
        this.firstFocusableElement = this.focusableElements[0];
        this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }

    /**
     * Abre el menú
     */
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        
        // Update classes and attributes
        this.menuContainer.classList.remove('hidden');
        this.toggleButton.setAttribute('aria-expanded', 'true');
        this.toggleButton.setAttribute('aria-label', 'Cerrar menú de navegación');
        this.menuContainer.setAttribute('aria-hidden', 'false');
        
        // Enable tab navigation for links
        const links = this.menuContainer.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('tabindex', '0');
        });
        
        // Animation
        requestAnimationFrame(() => {
            this.menuContainer.classList.add('opacity-100');
            this.menuContainer.classList.remove('opacity-0');
        });
        
        // Focus management
        if (this.options.trapFocus && this.firstFocusableElement) {
            this.firstFocusableElement.focus();
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Update toggle button icon
        this.updateToggleIcon(true);
        
        // Trigger custom event
        this.menuContainer.dispatchEvent(new CustomEvent('mobileMenu:opened'));
    }

    /**
     * Cierra el menú
     */
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Update classes and attributes
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.toggleButton.setAttribute('aria-label', 'Abrir menú de navegación');
        this.menuContainer.setAttribute('aria-hidden', 'true');
        
        // Disable tab navigation for links
        const links = this.menuContainer.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('tabindex', '-1');
        });
        
        // Animation
        this.menuContainer.classList.add('opacity-0');
        this.menuContainer.classList.remove('opacity-100');
        
        setTimeout(() => {
            if (!this.isOpen) {
                this.menuContainer.classList.add('hidden');
            }
        }, this.options.animationDuration);
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to toggle button
        this.toggleButton.focus();
        
        // Update toggle button icon
        this.updateToggleIcon(false);
        
        // Trigger custom event
        this.menuContainer.dispatchEvent(new CustomEvent('mobileMenu:closed'));
    }

    /**
     * Alterna el menú
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Actualiza el ícono del botón
     */
    updateToggleIcon(isOpen) {
        const icon = this.toggleButton.querySelector('svg');
        if (!icon) return;
        
        if (isOpen) {
            // Cambiar a X
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
        } else {
            // Cambiar a hamburguesa
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
        }
    }

    /**
     * Maneja clics fuera del menú
     */
    handleOutsideClick(event) {
        if (!this.isOpen) return;
        
        const isClickInsideMenu = this.menuContainer.contains(event.target);
        const isClickOnToggle = this.toggleButton.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle) {
            this.close();
        }
    }

    /**
     * Maneja clics en links del menú
     */
    handleLinkClick(event) {
        const link = event.target.closest('a');
        if (link && link.getAttribute('href').startsWith('#')) {
            // Es un link interno, cerrar menú
            setTimeout(() => this.close(), 100);
        }
    }

    /**
     * Maneja navegación por teclado
     */
    handleKeydown(event) {
        if (!this.isOpen) return;
        
        const { key } = event;
        
        switch (key) {
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
                
            case 'Tab':
                if (!this.options.trapFocus) return;
                
                event.preventDefault();
                
                const currentFocusIndex = Array.from(this.focusableElements).indexOf(document.activeElement);
                
                if (event.shiftKey) {
                    // Shift + Tab (backward)
                    if (currentFocusIndex === 0) {
                        this.lastFocusableElement?.focus();
                    } else {
                        this.focusableElements[currentFocusIndex - 1]?.focus();
                    }
                } else {
                    // Tab (forward)
                    if (currentFocusIndex === this.focusableElements.length - 1) {
                        this.firstFocusableElement?.focus();
                    } else {
                        this.focusableElements[currentFocusIndex + 1]?.focus();
                    }
                }
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.focusNextItem();
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.focusPrevItem();
                break;
                
            case 'Home':
                event.preventDefault();
                this.firstFocusableElement?.focus();
                break;
                
            case 'End':
                event.preventDefault();
                this.lastFocusableElement?.focus();
                break;
        }
    }

    /**
     * Enfoca el siguiente elemento
     */
    focusNextItem() {
        const currentFocusIndex = Array.from(this.focusableElements).indexOf(document.activeElement);
        const nextIndex = (currentFocusIndex + 1) % this.focusableElements.length;
        this.focusableElements[nextIndex]?.focus();
    }

    /**
     * Enfoca el elemento anterior
     */
    focusPrevItem() {
        const currentFocusIndex = Array.from(this.focusableElements).indexOf(document.activeElement);
        const prevIndex = (currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
        this.focusableElements[prevIndex]?.focus();
    }

    /**
     * Maneja cambios de tamaño
     */
    onResize() {
        // Cerrar menú en pantallas grandes
        if (window.innerWidth >= 768 && this.isOpen) {
            this.close();
        }
    }

    /**
     * Destruye el menú móvil
     */
    destroy() {
        // Cerrar menú si está abierto
        if (this.isOpen) {
            this.close();
        }
        
        // Remover event listeners
        this.toggleButton.removeEventListener('click', this.toggle);
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleKeydown);
        
        const links = this.menuContainer.querySelectorAll('a');
        links.forEach(link => {
            link.removeEventListener('click', this.handleLinkClick);
        });
        
        // Restaurar body scroll
        document.body.style.overflow = '';
        
        // Limpiar referencias
        this.focusableElements = [];
        this.firstFocusableElement = null;
        this.lastFocusableElement = null;
    }
}