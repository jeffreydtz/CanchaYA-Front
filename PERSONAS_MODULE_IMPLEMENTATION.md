# Módulo Personas - Implementación Frontend

## Resumen
Implementación completa del módulo de Personas para CanchaYA según especificación oficial.

## Cambios Realizados

### 1. API Client (`lib/api-client.ts`)
Añadidos endpoints completos del módulo Personas:
- ✅ `getPersonas()` - GET /personas (admin only) - Listar todas las personas
- ✅ `searchPersonas(q)` - GET /personas/search?q=texto - Buscar personas (min 2 chars, max 20 results)
- ✅ `getPersona(id)` - GET /personas/:id - Obtener persona por ID (admin/owner)
- ✅ `updatePersona(id, data)` - PUT /personas/:id - Actualizar persona (admin/owner)
- ✅ `deletePersona(id)` - DELETE /personas/:id - Eliminar persona (admin only)
- ✅ `uploadPersonaAvatar(id, file)` - POST /personas/:id/avatar - Subir avatar (admin/owner)

**Cambios:**
- Método `updatePersona` actualizado de PATCH a PUT según especificación
- Avatar upload ahora usa endpoint correcto `/personas/:id/avatar`

### 2. Componentes Nuevos

#### `components/personas/persona-search.tsx`
- Búsqueda con autocompletado
- Debounce de 300ms
- Validación de mínimo 2 caracteres
- Muestra avatar o iniciales
- Máximo 20 resultados

#### `components/personas/persona-avatar.tsx`
- Upload de avatar con preview
- Validación: JPEG/PNG, < 5MB
- Loading spinner durante upload
- Manejo de errores 403/404/409/400
- Fallback a iniciales cuando no hay avatar

#### `components/personas/persona-edit-form.tsx`
- Formulario con React Hook Form + Zod
- Validación de campos: nombre, apellido, email
- Manejo de errores específicos (403, 409, 400, 404)
- Deshabilita botón "Guardar" si no hay cambios
- Toast notifications para éxito/error

#### `components/personas/persona-profile.tsx`
- Vista de perfil completo
- Avatar con opción de edición (owner/admin)
- Modo edición inline
- Estados de carga y error
- Skeleton loading state

#### `components/personas/index.ts`
- Exports centralizados para facilitar imports

### 3. Página de Administración

#### `app/admin/personas/page.tsx`
- Lista todas las personas (solo admin)
- Búsqueda por nombre, apellido o email
- Ver/editar detalles de persona
- Eliminar personas
- Dialogs para ver perfil y confirmar eliminación
- Badge con contador de personas

### 4. Actualizaciones de UI

#### `components/admin/admin-sidebar.tsx`
- Añadido menú "Personas" con icono UserCog
- Enlace a `/admin/personas`

#### `app/(dashboard)/profile/page.tsx`
- Actualizado para usar `uploadPersonaAvatar` del API client
- Mejor manejo de errores con mensajes específicos
- Usa `personaId` en lugar de `user.id`

## Reglas de Seguridad Implementadas

Según la documentación oficial:

| Acción | Owner | Otros usuarios | Admin |
|--------|-------|----------------|-------|
| Listar todas | ❌ | ❌ | ✅ |
| Buscar por texto | ✅ | ✅ | ✅ |
| Obtener perfil | ✅ | ❌ | ✅ |
| Actualizar perfil | ✅ | ❌ | ✅ |
| Eliminar persona | ❌ | ❌ | ✅ |
| Subir avatar | ✅ | ❌ | ✅ |

**Owner** = usuario logueado cuyo `personaId` coincide con `:id`

## Manejo de Errores

Todos los componentes manejan correctamente:
- **400** Bad Request - Campos inválidos → "Revisá los datos e intentá nuevamente"
- **403** Forbidden - No es admin u owner → "No tienes permiso para acceder a este perfil"
- **404** Not Found - Persona no existe → "Persona no encontrada"
- **409** Conflict - Email duplicado → "El email ya está registrado"
- **500** Internal Server Error → "Error interno"

## UX/UI Según Recomendaciones

✅ **Perfil del usuario**
- Nombre + apellido en encabezado
- Avatar circular con fallback a iniciales
- Botón "Cambiar foto" visible solo para owner/admin
- Botón "Guardar cambios" deshabilitado si no hay modificaciones

✅ **Manejo de errores visuales**
- Mensajes específicos con toast notifications
- Colores distintivos por tipo de error

✅ **Avatar**
- Previsualización al seleccionar archivo
- Fallback con iniciales cuando no hay avatar
- Validación de tamaño y extensión antes de enviar

## Checklist Frontend Completado

- ✅ Usar baseURL correcta → `/api/personas`
- ✅ Subir avatar con POST
- ✅ Usar FormData
- ✅ Enviar Authorization Bearer
- ✅ Validar permisos (owner/admin)
- ✅ Bloquear email si el backend no permite modificarlo
- ✅ Manejar errores 403/409 correctamente

## Pruebas Recomendadas

1. **Admin Panel**: Navegar a `/admin/personas` y verificar lista
2. **Búsqueda**: Probar autocompletado con diferentes términos
3. **Perfil**: Ver y editar perfil propio en `/profile`
4. **Avatar**: Subir diferentes tipos de archivos y tamaños
5. **Permisos**: Verificar que usuarios normales no puedan ver perfiles ajenos
6. **Errores**: Probar con email duplicado, archivos grandes, etc.

## Tecnologías Utilizadas

- React Hook Form + Zod para validación
- shadcn/ui components (Card, Dialog, Avatar, etc.)
- Sonner para toast notifications
- Lucide React para iconos
- TypeScript para type safety

## Notas Adicionales

- Todos los componentes son "use client" (client-side)
- Estados de carga implementados con Skeleton UI
- Responsive design con Tailwind CSS
- Accesibilidad con labels y ARIA attributes
- Dark mode compatible
