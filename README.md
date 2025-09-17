## Getting Started

### Requisitos Previos

- Node.js instalado en tu sistema
- npm o yarn como gestor de paquetes

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/Cristian-Usme/PPE_Taller02_Bundle_WebPack.git
   cd PPE_Taller02_Bundle_WebPack
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

### Scripts Disponibles

El proyecto incluye varios scripts npm para diferentes entornos: [2](#0-1)

- **Desarrollo con servidor en vivo**: `npm run dev` - Inicia el servidor de desarrollo con recarga automática
- **Build de producción**: `npm run build` - Genera la versión optimizada para producción
- **Build de desarrollo**: `npm run build:dev` - Genera una versión de desarrollo
- **Modo watch**: `npm run watch` - Observa cambios en los archivos
- **Limpiar**: `npm run clean` - Elimina la carpeta dist

### Estructura del Proyecto

La aplicación está organizada con una arquitectura modular: [3](#0-2)

- **Punto de entrada**: `src/js/index.js` - Clase principal `PanOroApp`
- **Módulos interactivos**: `src/js/modules/` - Componentes como BannerRotator, MobileMenu, ContactForm, etc.
- **Estilos**: `src/css/index.css` - Estilos con Tailwind CSS

### Inicialización de la Aplicación

La aplicación se inicializa automáticamente cuando el DOM está listo: [4](#0-3)

La clase `PanOroApp` maneja la inicialización de todos los componentes y eventos globales, incluyendo manejo de errores y monitoreo de rendimiento.

### Tecnologías Utilizadas

- **Webpack 5**: Bundling y procesamiento de assets [5](#0-4)
- **Tailwind CSS**: Framework de utilidades CSS [6](#0-5)
- **PostCSS**: Procesamiento de CSS [7](#0-6)

## Notes

El proyecto implementa una arquitectura modular con componentes JavaScript independientes que se comunican a través de eventos personalizados. Cada módulo maneja su propia funcionalidad (menú móvil, formulario de contacto, modal de imágenes, etc.) y se integra con la aplicación principal a través de la clase `PanOroApp`. La aplicación incluye características de accesibilidad, manejo de errores robusto y optimizaciones de rendimiento.

Wiki pages you might want to explore:

- [Overview (Cristian-Usme/PPE_Taller02_Bundle_WebPack)](/wiki/Cristian-Usme/PPE_Taller02_Bundle_WebPack#1)
- [Interactive Components (Cristian-Usme/PPE_Taller02_Bundle_WebPack)](/wiki/Cristian-Usme/PPE_Taller02_Bundle_WebPack#3)
