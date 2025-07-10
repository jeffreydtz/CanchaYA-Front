# 🏟️ CanchaYA - Plataforma de Reservas Deportivas

[![Deploy with Vercel](https://vercel.com/button)](https://cancha-ya-is.vercel.app/)

## 🌐 Demo en Vivo

**Visita la aplicación:** [https://cancha-ya-is.vercel.app/](https://cancha-ya-is.vercel.app/)

## 📋 Descripción

CanchaYA es una plataforma moderna y completa para la reserva de canchas deportivas. Permite a los usuarios buscar, reservar y gestionar sus reservas de canchas de fútbol, pádel, tenis, básquet y vóley de manera intuitiva y eficiente.

## ✨ Funcionalidades Principales

### 👤 Para Usuarios
- **Búsqueda avanzada** de canchas por deporte, club, fecha y ubicación
- **Reserva en tiempo real** con confirmación automática
- **Gestión de reservas** (confirmar, cancelar, ver historial)
- **Notificaciones** en tiempo real para cambios de estado
- **Perfil de usuario** con historial de reservas
- **Sistema de autenticación** seguro

### 🏢 Para Administradores
- **Panel de administración** completo
- **Gestión de canchas** (crear, editar, eliminar)
- **Gestión de usuarios** y reservas
- **Reportes y estadísticas** en tiempo real
- **Notificaciones** masivas

### 🎯 Características Técnicas
- **Responsive Design** - Funciona perfectamente en móviles y desktop
- **Tiempo Real** - Actualizaciones instantáneas con Server-Sent Events
- **SEO Optimizado** - Meta tags y estructura semántica
- **Accesibilidad** - Cumple estándares WCAG
- **Performance** - Optimizado para velocidad

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes UI modernos y accesibles
- **Lucide React** - Iconografía consistente
- **Date-fns** - Manipulación de fechas
- **React Hook Form** - Gestión de formularios

### Backend (API)
- **NestJS** - Framework Node.js para APIs
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **Server-Sent Events** - Comunicación en tiempo real

### Testing & Quality
- **Jest** - Framework de testing
- **React Testing Library** - Testing de componentes
- **Playwright** - Testing E2E
- **Storybook** - Documentación de componentes
- **ESLint & Prettier** - Linting y formateo

### Deployment
- **Vercel** - Hosting y deployment automático
- **GitHub Actions** - CI/CD pipeline

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- PostgreSQL (para el backend)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/cancha-ya-front.git
cd cancha-ya-front
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# JWT Secret (para desarrollo)
JWT_SECRET=tu-jwt-secret-aqui

# NextAuth Secret
NEXTAUTH_SECRET=tu-nextauth-secret-aqui
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
cancha-ya-front/
├── app/                    # App Router de Next.js
│   ├── (dashboard)/       # Página principal
│   ├── admin/             # Panel de administración
│   ├── cancha/[id]/       # Detalle de cancha
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── mis-reservas/      # Mis reservas
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── court/            # Componentes de canchas
│   └── reservations/     # Componentes de reservas
├── lib/                  # Utilidades y configuraciones
│   ├── api-client.ts     # Cliente API
│   ├── actions.ts        # Server Actions
│   ├── auth.ts           # Autenticación
│   └── utils.ts          # Utilidades generales
├── hooks/                # Custom hooks
├── __tests__/            # Tests unitarios
├── e2e/                  # Tests end-to-end
└── public/               # Archivos estáticos
```

## 🧪 Testing

### Tests Unitarios
```bash
npm test
```

### Tests E2E
```bash
npm run test:e2e
```

### Storybook
```bash
npm run storybook
```

## 🚀 Deployment

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push

### Variables de entorno para producción
```env
NEXT_PUBLIC_BACKEND_URL=https://tu-api-backend.com
JWT_SECRET=tu-jwt-secret-produccion
NEXTAUTH_SECRET=tu-nextauth-secret-produccion
```

## 📱 Funcionalidades por Dispositivo

### 📱 Móvil
- Navegación optimizada para touch
- Búsqueda rápida con filtros
- Reserva en 3 clics
- Notificaciones push

### 💻 Desktop
- Panel completo de administración
- Filtros avanzados
- Vista de calendario
- Reportes detallados

## 🔒 Seguridad

- **Autenticación JWT** con tokens HTTP-only
- **Validación** de formularios en cliente y servidor
- **Sanitización** de datos de entrada
- **CORS** configurado correctamente
- **Rate limiting** en endpoints críticos

## 📊 Performance

- **Lighthouse Score**: 95+ en todas las métricas
- **Core Web Vitals**: Optimizados
- **Bundle Size**: < 500KB inicial
- **Loading Time**: < 2s en conexiones 3G

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Email**: info@canchaya.com
- **Teléfono**: +54 341 123-4567
- **Ubicación**: Rosario, Santa Fe, Argentina
- **Website**: [https://cancha-ya-is.vercel.app/](https://cancha-ya-is.vercel.app/)

## 🙏 Agradecimientos

- [Shadcn/ui](https://ui.shadcn.com/) por los componentes base
- [Vercel](https://vercel.com/) por el hosting
- [Tailwind CSS](https://tailwindcss.com/) por el framework CSS
- [Lucide](https://lucide.dev/) por los iconos

---

**¿Listo para reservar tu cancha?** 🏟️⚽

[Visita CanchaYA ahora](https://cancha-ya-is.vercel.app/)

