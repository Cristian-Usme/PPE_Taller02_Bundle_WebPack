/**
 * Módulo ContactForm - Formulario de contacto mejorado
 */
export class ContactForm {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            validateOnBlur: true,
            showSuccessMessage: true,
            resetOnSuccess: true,
            submitEndpoint: null,
            requiredFields: ['name', 'email', 'message'],
            ...options
        };
        
        this.isSubmitting = false;
        this.validators = {
            name: this.validateName.bind(this),
            email: this.validateEmail.bind(this),
            message: this.validateMessage.bind(this)
        };
        
        // Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFieldBlur = this.handleFieldBlur.bind(this);
        this.handleFieldInput = this.handleFieldInput.bind(this);
    }

    /**
     * Inicializa el formulario de contacto
     */
    async init() {
        try {
            this.setupFormElements();
            this.setupValidation();
            this.setupEventListeners();
            this.setupAccessibility();
            
            console.log('✅ ContactForm inicializado correctamente');
            
        } catch (error) {
            console.error('Error inicializando ContactForm:', error);
            throw error;
        }
    }

    /**
     * Configura los elementos del formulario
     */
    setupFormElements() {
        this.fields = {
            name: this.form.querySelector('input[name="name"], input[type="text"]'),
            email: this.form.querySelector('input[name="email"], input[type="email"]'),
            message: this.form.querySelector('textarea[name="message"], textarea')
        };
        
        this.submitButton = this.form.querySelector('button[type="submit"], input[type="submit"]');
        
        // Crear elementos para mensajes de error si no existen
        Object.entries(this.fields).forEach(([fieldName, field]) => {
            if (field && !field.nextElementSibling?.classList.contains('error-message')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-red-500 text-sm mt-1 hidden';
                errorDiv.setAttribute('role', 'alert');
                field.parentNode.appendChild(errorDiv);
            }
        });
    }

    /**
     * Configura la validación
     */
    setupValidation() {
        // Configurar validación en tiempo real
        Object.entries(this.fields).forEach(([fieldName, field]) => {
            if (!field) return;
            
            // Validación on blur
            if (this.options.validateOnBlur) {
                field.addEventListener('blur', () => this.handleFieldBlur(fieldName, field));
            }
            
            // Limpiar errores on input
            field.addEventListener('input', () => this.handleFieldInput(fieldName, field));
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit);
        
        // Prevenir envío con Enter en textarea (solo con Ctrl+Enter)
        const textarea = this.fields.message;
        if (textarea) {
            textarea.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && event.ctrlKey) {
                    this.handleSubmit(event);
                }
            });
        }
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        // Agregar labels y describedby
        Object.entries(this.fields).forEach(([fieldName, field]) => {
            if (!field) return;
            
            const label = this.form.querySelector(`label[for="${field.id}"]`);
            if (!label && !field.getAttribute('aria-label')) {
                field.setAttribute('aria-label', this.getFieldLabel(fieldName));
            }
            
            // Conectar con mensaje de error
            const errorDiv = field.parentNode.querySelector('.error-message');
            if (errorDiv && !errorDiv.id) {
                errorDiv.id = `${fieldName}-error`;
                field.setAttribute('aria-describedby', errorDiv.id);
            }
        });
        
        // Marcar campos requeridos
        this.options.requiredFields.forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field) {
                field.setAttribute('required', '');
                field.setAttribute('aria-required', 'true');
            }
        });
    }

    /**
     * Obtiene el label apropiado para un campo
     */
    getFieldLabel(fieldName) {
        const labels = {
            name: 'Nombre completo',
            email: 'Correo electrónico',
            message: 'Mensaje'
        };
        return labels[fieldName] || fieldName;
    }

    /**
     * Maneja el envío del formulario
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        try {
            // Validar formulario completo
            const isValid = this.validateForm();
            if (!isValid) {
                this.focusFirstError();
                return;
            }
            
            this.setSubmittingState(true);
            
            // Recopilar datos del formulario
            const formData = this.getFormData();
            
            // Enviar datos
            const success = await this.submitForm(formData);
            
            if (success) {
                this.showSuccessMessage();
                
                if (this.options.resetOnSuccess) {
                    this.resetForm();
                }
                
                // Trigger custom event
                this.form.dispatchEvent(new CustomEvent('formSubmitSuccess', {
                    detail: { formData }
                }));
            }
            
        } catch (error) {
            console.error('Error enviando formulario:', error);
            this.showErrorMessage('Ha ocurrido un error al enviar el formulario. Por favor, intenta nuevamente.');
            
            // Trigger custom event
            this.form.dispatchEvent(new CustomEvent('formSubmitError', {
                detail: { error }
            }));
            
        } finally {
            this.setSubmittingState(false);
        }
    }

    /**
     * Valida todo el formulario
     */
    validateForm() {
        let isValid = true;
        
        Object.entries(this.fields).forEach(([fieldName, field]) => {
            if (field) {
                const fieldIsValid = this.validateField(fieldName, field);
                if (!fieldIsValid) {
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    /**
     * Valida un campo específico
     */
    validateField(fieldName, field) {
        const validator = this.validators[fieldName];
        if (!validator) return true;
        
        const result = validator(field.value.trim());
        this.showFieldError(fieldName, field, result.isValid ? null : result.message);
        
        return result.isValid;
    }

    /**
     * Validador para el nombre
     */
    validateName(value) {
        if (!value) {
            return { isValid: false, message: 'El nombre es requerido' };
        }
        
        if (value.length < 2) {
            return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
        }
        
        if (value.length > 50) {
            return { isValid: false, message: 'El nombre no puede tener más de 50 caracteres' };
        }
        
        return { isValid: true };
    }

    /**
     * Validador para el email
     */
    validateEmail(value) {
        if (!value) {
            return { isValid: false, message: 'El correo electrónico es requerido' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { isValid: false, message: 'Por favor, ingresa un correo electrónico válido' };
        }
        
        return { isValid: true };
    }

    /**
     * Validador para el mensaje
     */
    validateMessage(value) {
        if (!value) {
            return { isValid: false, message: 'El mensaje es requerido' };
        }
        
        if (value.length < 10) {
            return { isValid: false, message: 'El mensaje debe tener al menos 10 caracteres' };
        }
        
        if (value.length > 1000) {
            return { isValid: false, message: 'El mensaje no puede tener más de 1000 caracteres' };
        }
        
        return { isValid: true };
    }

    /**
     * Muestra u oculta error de campo
     */
    showFieldError(fieldName, field, message) {
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (!errorDiv) return;
        
        if (message) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.remove('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
            field.setAttribute('aria-invalid', 'true');
        } else {
            errorDiv.classList.add('hidden');
            field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.add('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
            field.setAttribute('aria-invalid', 'false');
        }
    }

    /**
     * Maneja blur en campos
     */
    handleFieldBlur(fieldName, field) {
        this.validateField(fieldName, field);
    }

    /**
     * Maneja input en campos
     */
    handleFieldInput(fieldName, field) {
        // Limpiar errores mientras el usuario escribe
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv && !errorDiv.classList.contains('hidden')) {
            this.showFieldError(fieldName, field, null);
        }
    }

    /**
     * Obtiene los datos del formulario
     */
    getFormData() {
        const data = {};
        
        Object.entries(this.fields).forEach(([fieldName, field]) => {
            if (field) {
                data[fieldName] = field.value.trim();
            }
        });
        
        return data;
    }

    /**
     * Envía el formulario
     */
    async submitForm(formData) {
        if (this.options.submitEndpoint) {
            // Envío real a endpoint
            const response = await fetch(this.options.submitEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            return response.ok;
        } else {
            // Simulación para demo
            console.log('📧 Datos del formulario:', formData);
            
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            return true;
        }
    }

    /**
     * Establece el estado de envío
     */
    setSubmittingState(isSubmitting) {
        this.isSubmitting = isSubmitting;
        
        if (this.submitButton) {
            this.submitButton.disabled = isSubmitting;
            
            if (isSubmitting) {
                this.originalButtonText = this.submitButton.textContent;
                this.submitButton.textContent = 'Enviando...';
                this.submitButton.classList.add('opacity-75', 'cursor-not-allowed');
            } else {
                this.submitButton.textContent = this.originalButtonText;
                this.submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        }
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccessMessage() {
        this.showMessage('¡Gracias por contactarnos! Te responderemos pronto.', 'success');
    }

    /**
     * Muestra mensaje de error
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Muestra un mensaje temporal
     */
    showMessage(message, type) {
        // Remover mensaje existente
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message p-4 rounded-lg mb-4 ${
            type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
        }`;
        messageDiv.textContent = message;
        messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
        
        // Insertar al inicio del formulario
        this.form.insertBefore(messageDiv, this.form.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    /**
     * Enfoca el primer campo con error
     */
    focusFirstError() {
        const firstErrorField = this.form.querySelector('.border-red-500');
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }

    /**
     * Resetea el formulario
     */
    resetForm() {
        this.form.reset();
        
        // Limpiar errores
        Object.entries(this.fields).forEach(([fieldName, field]) => {
            if (field) {
                this.showFieldError(fieldName, field, null);
            }
        });
        
        // Remover mensajes
        const formMessage = this.form.querySelector('.form-message');
        if (formMessage) {
            formMessage.remove();
        }
    }

    /**
     * Destruye el formulario de contacto
     */
    destroy() {
        // Remover event listeners
        this.form.removeEventListener('submit', this.handleSubmit);
        
        Object.entries(this.fields).forEach(([fieldName, field]) => {
            if (field) {
                field.removeEventListener('blur', this.handleFieldBlur);
                field.removeEventListener('input', this.handleFieldInput);
            }
        });
        
        // Limpiar referencias
        this.fields = {};
        this.submitButton = null;
    }
}