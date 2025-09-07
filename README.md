# 🎮 PokéTrainer - Angular App

Una aplicación web moderna para entrenadores Pokémon que permite explorar, capturar y gestionar tu colección de Pokémon utilizando la [PokéAPI](https://pokeapi.co/).

## ✨ Características

### 🔐 Sistema de Autenticación
- **Registro e inicio de sesión** con validación de formularios
- **Guards de autenticación** para proteger rutas
- **Gestión de sesiones** con localStorage

### 📊 Dashboard Principal
- **Métricas de progreso** (Pokémon capturados, porcentaje de Pokédex completado)
- **Recomendaciones inteligentes** basadas en Pokémon más fuertes
- **Vista de capturas recientes** con estadísticas
- **Actualización automática** cada 10 minutos

### 🎯 Pokédex Interactiva
- **Exploración de Pokémon** con la PokéAPI en tiempo real
- **Filtros avanzados** por tipo, región y generación
- **Sistema de captura** con niveles aleatorios
- **Vista de tabla y tarjetas** con información detallada
- **Búsqueda y paginación** optimizada

### 📱 Características Técnicas
- **Aplicación PWA** con Angular 20
- **Diseño responsivo** con Tailwind CSS y PrimeNG
- **Internacionalización** (Español/Inglés)
- **Almacenamiento local** persistente
- **Server-Side Rendering (SSR)** incluido

## 🛠️ Tecnologías Utilizadas

### Frontend Framework
- **Angular 20.2** - Framework principal
- **TypeScript 5.9** - Lenguaje de programación
- **Angular Router** - Navegación SPA
- **Angular Forms** - Formularios reactivos

### UI/UX
- **PrimeNG 20.1** - Componentes UI avanzados
- **Tailwind CSS 4.1** - Framework de estilos utilitarios
- **DaisyUI 5.0** - Componentes adicionales para Tailwind
- **Angular Animations** - Transiciones y efectos

### Funcionalidades
- **@ngx-translate/core** - Internacionalización i18n
- **SweetAlert2** - Alertas y modales elegantes
- **RxJS 7.8** - Programación reactiva
- **Angular SSR** - Renderizado del lado del servidor

### Desarrollo
- **Angular CLI 20.2** - Herramientas de desarrollo
- **Karma + Jasmine** - Testing unitario
- **ESLint + Prettier** - Linting y formateo de código

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Angular CLI

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/UpDavo/pokeapi-test.git
cd poke-api-angular
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm start
# o
ng serve
```

4. **Abrir en el navegador**
```
http://localhost:4200
```

## 📝 Scripts Disponibles

```bash
npm start          # Servidor de desarrollo
npm run build      # Compilación para producción
npm test           # Ejecutar pruebas unitarias
npm run watch      # Compilación en modo watch
npm run build:css  # Compilar estilos con PostCSS
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── guards/           # Guards de autenticación
│   ├── interceptors/     # HTTP Interceptors
│   ├── interfaces/       # Interfaces TypeScript
│   ├── pages/           # Componentes de páginas
│   │   ├── home/        # Dashboard principal
│   │   ├── pokedex/     # Explorador de Pokémon
│   │   ├── login/       # Autenticación
│   │   └── team/        # Gestión de equipos
│   ├── services/        # Servicios Angular
│   ├── theme/           # Configuración de temas
│   └── utils/           # Utilidades y helpers
├── assets/
│   └── i18n/           # Archivos de traducción
└── styles.css          # Estilos globales
```

## 🎯 Funcionalidades Principales

### Pokédex
- Exploración de +1000 Pokémon
- Filtros por tipo, región y generación
- Sistema de captura con estadísticas
- Gestión de colección personal

### Dashboard
- Métricas de progreso en tiempo real
- Recomendaciones basadas en estadísticas
- Vista de capturas recientes
- Análisis de tipos favoritos

### Gestión de Datos
- Almacenamiento local persistente
- Sincronización con PokéAPI
- Exportación/Importación de datos
- Sistema de caché optimizado

## 🌐 Configuración de Idiomas

La aplicación soporta múltiples idiomas:
- 🇪🇸 Español (por defecto)
- 🇺🇸 English
- 🇧🇷 Português

Los archivos de traducción se encuentran en `public/assets/i18n/`.

## 🎨 Personalización de Temas

El proyecto incluye un tema personalizado basado en PrimeNG con:
- Paleta de colores Pokémon
- Componentes optimizados
- Modo responsive completo

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```typescript
// src/app/mock/mock.ts
export const mock = {
  is_dev: true,
  user: {
    email: 'usuario@dominio.com',
    password: '12345678',
  },
};
```

### Configuración de API
La aplicación utiliza la PokéAPI pública:
- Base URL: `https://pokeapi.co/api/v2`
- Sin autenticación requerida
- Rate limiting considerado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a [@UpDavo](https://github.com/UpDavo).

## 🙏 Reconocimientos

- [PokéAPI](https://pokeapi.co/) - API de datos Pokémon
- [Angular Team](https://angular.io/) - Framework
- [PrimeNG](https://primeng.org/) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework de estilos

---

Desarrollado con ❤️ por [@UpDavo](https://github.com/UpDavo)
