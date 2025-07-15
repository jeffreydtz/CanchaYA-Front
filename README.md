# CanchaYA Frontend

Una aplicación web moderna para la reserva de canchas deportivas, construida con Next.js 14, TypeScript y Tailwind CSS.

## 🚀 Características Principales

### Para Usuarios
- **Autenticación segura** con JWT tokens
- **Búsqueda y filtrado** de canchas por ubicación, deporte y disponibilidad
- **Reserva en tiempo real** con confirmación instantánea
- **Gestión de reservas** - ver, confirmar y cancelar
- **Interfaz responsive** optimizada para móviles y desktop
- **Notificaciones** en tiempo real sobre el estado de las reservas

### Para Administradores
- **Panel de administración** completo
- **Gestión de canchas** - crear, editar y eliminar
- **Gestión de usuarios** y permisos
- **Reportes detallados** de ocupación e ingresos
- **Gestión de clubes y deportes**

## 🛠️ Stack Tecnológico

### Frontend Core
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático y mejor DX
- **Tailwind CSS** - Diseño utility-first responsive
- **shadcn/ui** - Componentes UI modernos y accesibles

### Estado y Datos
- **React Hook Form** - Manejo de formularios optimizado
- **Zod** - Validación de esquemas
- **Sonner** - Notificaciones toast elegantes
- **JWT** - Autenticación segura

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
- Backend de CanchaYA ejecutándose

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
NEXT_PUBLIC_BACKEND_URL=https://backend-cancha-ya-production.up.railway.app/api

# Para desarrollo local (si ejecutas el backend localmente):
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/api

# JWT Secret (para desarrollo)
JWT_SECRET=cancha-ya-jwt-secret-development

# NextAuth Secret
NEXTAUTH_SECRET=cancha-ya-nextauth-secret-development

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
│   ├── api-client.ts     # Cliente API (alineado con backend)
│   ├── actions.ts        # Server Actions
│   ├── auth.ts           # Autenticación client-side
│   ├── auth-server.ts    # Autenticación server-side
│   └── utils.ts          # Utilidades generales
├── hooks/                # Custom hooks
├── __tests__/            # Tests unitarios
├── e2e/                  # Tests end-to-end
└── public/               # Archivos estáticos
```

## 🔗 Integración con Backend

Esta aplicación está completamente integrada con el backend de CanchaYA. Los endpoints principales incluyen:

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /usuarios/registro` - Registrarse

### Gestión de Recursos
- `/usuarios` - Gestión de usuarios
- `/canchas` - Gestión de canchas
- `/clubes` - Gestión de clubes  
- `/deportes` - Gestión de deportes
- `/reservas` - Gestión de reservas
- `/equipos` - Gestión de equipos
- `/desafios` - Sistema de desafíos
- `/deudas` - Gestión de deudas
- `/horarios` - Gestión de horarios
- `/valoraciones` - Sistema de valoraciones

### Reportes y Analytics
- `/reportes/reservas` - Reportes de reservas
- `/reportes/ingresos` - Reportes de ingresos
- `/reportes/canchas-top` - Canchas más populares
- `/competicion/jugadores-ranking` - Ranking de jugadores

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
2. Configura las variables de entorno en Vercel:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://backend-cancha-ya-production.up.railway.app/api
   JWT_SECRET=tu-jwt-secret-produccion
   NEXTAUTH_SECRET=tu-nextauth-secret-produccion
   ```
3. Deploy automático en cada push

### Variables de entorno para producción
Asegúrate de configurar estas variables en tu plataforma de deployment:

```env
NEXT_PUBLIC_BACKEND_URL=https://tu-backend-produccion.com/api
JWT_SECRET=tu-jwt-secret-seguro-produccion
NEXTAUTH_SECRET=tu-nextauth-secret-seguro-produccion
NEXT_PUBLIC_APP_URL=https://tu-app-produccion.com
```

## 📱 Funcionalidades por Dispositivo

### 📱 Móvil
- Navegación optimizada para touch
- Búsqueda rápida con filtros
- Reserva en 3 clics
- Gestión completa de reservas

### 💻 Desktop
- Panel completo de administración
- Filtros avanzados
- Vista de calendario
- Reportes detallados

## 🔒 Seguridad

- **Autenticación JWT** con tokens seguros
- **Validación** de formularios en cliente y servidor
- **Sanitización** de datos de entrada
- **CORS** configurado correctamente
- **Rate limiting** manejado por el backend
- **Cookies HTTP-only** para tokens

## 📊 Performance

- **Next.js 14** con App Router para máxima performance
- **Server Components** para reducir bundle size
- **Loading States** optimizados
- **Error Boundaries** para mejor UX
- **Bundle Size** optimizado

## 🔧 API Client

El cliente API (`lib/api-client.ts`) está completamente alineado con el backend:

- **Tipos TypeScript** para todas las entidades
- **Manejo de errores** robusto
- **Autenticación automática** con JWT
- **Endpoints completos** para todas las funcionalidades

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas con la configuración o integración:

1. Verifica que el backend esté ejecutándose correctamente
2. Confirma que las variables de entorno estén configuradas
3. Revisa los logs del servidor y del cliente
4. Consulta la documentación del backend para cambios en la API

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

