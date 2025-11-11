# Admin Dashboard Endpoints

Documentación completa de los endpoints del dashboard administrativo de CanchaYA.

## 🔐 Autenticación

Todos los endpoints bajo `/admin` requieren:
- **Token JWT** con rol `admin`
- **Header**: `Authorization: Bearer <TOKEN>`

### Credenciales Admin
```
Email: admin@canchaya.app
Password: Admin.1234
```

## 📊 Endpoints Implementados

### 1️⃣ Resumen General

**Endpoint**: `GET /admin/resumen`

**Descripción**: Devuelve métricas globales del sistema.

**Uso**:
```typescript
const response = await apiClient.getAdminResumen()
```

**Respuesta**:
```json
{
  "totalUsuarios": 124,
  "totalReservas": 845,
  "totalCanchas": 18,
  "deudaTotalPendiente": 23000.5
}
```

---

### 2️⃣ Top Jugadores

**Endpoint**: `GET /admin/top-jugadores`

**Descripción**: Top 10 jugadores según ranking (PerfilCompetitivo).

**Parámetros**:
- `from`: Fecha desde (YYYY-MM-DD) - opcional
- `to`: Fecha hasta (YYYY-MM-DD) - opcional

**Uso**:
```typescript
const response = await apiClient.getAdminTopJugadores('2025-06-01', '2025-11-01')
```

**Respuesta**:
```json
[
  {
    "personaId": "1",
    "nombre": "Juan Pérez",
    "email": "juan@gmail.com",
    "ranking": 89
  },
  {
    "personaId": "2",
    "nombre": "Lucas Fasolato",
    "email": "lucas@gmail.com",
    "ranking": 82
  }
]
```

---

### 3️⃣ Canchas Más Usadas

**Endpoint**: `GET /admin/canchas-mas-usadas`

**Descripción**: Canchas con mayor cantidad de reservas confirmadas.

**Parámetros**:
- `from`: Fecha desde (YYYY-MM-DD) - opcional
- `to`: Fecha hasta (YYYY-MM-DD) - opcional
- `tz`: Zona horaria (e.g., `America/Argentina/Cordoba`) - opcional

**Uso**:
```typescript
const response = await apiClient.getAdminCanchasMasUsadas(
  '2025-06-01',
  '2025-11-01',
  'America/Argentina/Cordoba'
)
```

**Respuesta**:
```json
[
  {
    "canchaId": "a1",
    "nombre": "Cancha 1",
    "totalReservas": 52
  },
  {
    "canchaId": "b2",
    "nombre": "Cancha 2",
    "totalReservas": 37
  }
]
```

---

### 4️⃣ Personas con Deuda

**Endpoint**: `GET /admin/personas-con-deuda`

**Descripción**: Lista de personas con deuda pendiente.

**Uso**:
```typescript
const response = await apiClient.getAdminPersonasConDeuda()
```

**Respuesta**:
```json
[
  {
    "personaId": "1",
    "nombre": "María Gómez",
    "email": "maria@gmail.com",
    "totalDeuda": 1200
  },
  {
    "personaId": "2",
    "nombre": "Pedro Silva",
    "email": "pedro@gmail.com",
    "totalDeuda": 750
  }
]
```

---

### 5️⃣ Reservas - Aggregate

**Endpoint**: `GET /admin/reservas/aggregate`

**Descripción**: Evolución de reservas agrupadas por día, semana o mes.

**Parámetros**:
- `granularity`: `'day'` | `'week'` | `'month'` - **requerido**
- `from`: Fecha desde (YYYY-MM-DD) - **requerido**
- `to`: Fecha hasta (YYYY-MM-DD) - **requerido**
- `tz`: Zona horaria - opcional

**Uso**:
```typescript
const response = await apiClient.getAdminReservasAggregate(
  'week',
  '2025-06-01',
  '2025-11-01',
  'America/Argentina/Cordoba'
)
```

**Respuesta**:
```json
[
  {
    "bucket": "2025-06-01",
    "total": 4,
    "confirmadas": 3,
    "canceladas": 1,
    "pendientes": 0
  },
  {
    "bucket": "2025-06-08",
    "total": 7,
    "confirmadas": 6,
    "canceladas": 0,
    "pendientes": 1
  }
]
```

---

### 6️⃣ Reservas - Drilldown (3 niveles)

#### Nivel 1: Club

**Endpoint**: `GET /admin/reservas/drilldown?level=club`

**Uso**:
```typescript
const response = await apiClient.getAdminReservasDrilldownClub('2025-06-01', '2025-11-01')
```

**Respuesta**:
```json
[
  {
    "id": "c1",
    "nombre": "Club Rosario",
    "reservas": 58
  },
  {
    "id": "c2",
    "nombre": "Club Santa Fe",
    "reservas": 42
  }
]
```

#### Nivel 2: Cancha

**Endpoint**: `GET /admin/reservas/drilldown?level=cancha&clubId=<clubId>`

**Uso**:
```typescript
const response = await apiClient.getAdminReservasDrilldownCancha(
  'c1',
  '2025-06-01',
  '2025-11-01'
)
```

**Respuesta**:
```json
[
  {
    "id": "a1",
    "nombre": "Cancha 5",
    "reservas": 18
  },
  {
    "id": "a2",
    "nombre": "Cancha 6",
    "reservas": 10
  }
]
```

#### Nivel 3: Detalle

**Endpoint**: `GET /admin/reservas/drilldown?level=detalle&canchaId=<canchaId>`

**Uso**:
```typescript
const response = await apiClient.getAdminReservasDrilldownDetalle(
  'a1',
  '2025-06-01',
  '2025-11-01'
)
```

**Respuesta**:
```json
[
  {
    "fecha": "2025-08-25",
    "reservas": 1
  },
  {
    "fecha": "2025-10-22",
    "reservas": 2
  },
  {
    "fecha": "2025-11-03",
    "reservas": 1
  }
]
```

---

### 7️⃣ Ocupación (Semaforización)

**Endpoint**: `GET /admin/ocupacion`

**Descripción**: Calcula el porcentaje de ocupación de slots disponibles y asigna un semáforo visual.

**Parámetros**:
- `by`: `'club'` | `'cancha'` - **requerido**
- `from`: Fecha desde (YYYY-MM-DD) - opcional
- `to`: Fecha hasta (YYYY-MM-DD) - opcional
- `tz`: Zona horaria - opcional

**Uso**:
```typescript
const response = await apiClient.getAdminOcupacion(
  'cancha',
  '2025-06-01',
  '2025-11-01',
  'America/Argentina/Cordoba'
)
```

**Respuesta**:
```json
[
  {
    "id": "a1",
    "nombre": "Cancha 1",
    "slots": 200,
    "reservas": 180,
    "ocupacion": 0.9,
    "semaforo": "verde"
  },
  {
    "id": "b2",
    "nombre": "Cancha 2",
    "slots": 150,
    "reservas": 90,
    "ocupacion": 0.6,
    "semaforo": "amarillo"
  },
  {
    "id": "c3",
    "nombre": "Cancha 3",
    "slots": 100,
    "reservas": 30,
    "ocupacion": 0.3,
    "semaforo": "rojo"
  }
]
```

**Semáforo**:
- 🟢 **Verde**: Ocupación >= 70%
- 🟡 **Amarillo**: Ocupación 40-69%
- 🔴 **Rojo**: Ocupación < 40%

---

### 8️⃣ Heatmap de Reservas

**Endpoint**: `GET /admin/reservas/heatmap`

**Descripción**: Cantidad de reservas por día de la semana y hora (ideal para mapa de calor).

**Parámetros**:
- `clubId`: ID del club - opcional
- `from`: Fecha desde (YYYY-MM-DD) - opcional
- `to`: Fecha hasta (YYYY-MM-DD) - opcional
- `tz`: Zona horaria - opcional

**Uso**:
```typescript
const response = await apiClient.getAdminReservasHeatmap(
  undefined,
  '2025-06-01',
  '2025-11-01',
  'America/Argentina/Cordoba'
)
```

**Respuesta**:
```json
[
  {
    "dow": 1,
    "hora": "18:00",
    "reservas": 5
  },
  {
    "dow": 3,
    "hora": "20:00",
    "reservas": 8
  },
  {
    "dow": 5,
    "hora": "19:00",
    "reservas": 12
  }
]
```

**dow (Day of Week)**:
- `0` = Domingo
- `1` = Lunes
- `2` = Martes
- `3` = Miércoles
- `4` = Jueves
- `5` = Viernes
- `6` = Sábado

---

## 🧪 Testing

Para probar todos los endpoints:

```bash
# Instalar dependencias
npm install

# Ejecutar script de pruebas
npx ts-node scripts/test-admin-endpoints.ts
```

## 📈 Uso en Componentes

### Ejemplo: Dashboard Page

```typescript
import apiClient from '@/lib/api-client'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [resumen, setResumen] = useState(null)

  useEffect(() => {
    async function loadData() {
      const response = await apiClient.getAdminResumen()
      if (!response.error) {
        setResumen(response.data)
      }
    }
    loadData()
  }, [])

  return (
    <div>
      <h1>Total Usuarios: {resumen?.totalUsuarios}</h1>
      <h1>Total Reservas: {resumen?.totalReservas}</h1>
    </div>
  )
}
```

## 🎨 Gráficos Recomendados

- **LineChart** → `/admin/reservas/aggregate`
- **BarChart** → `/admin/reservas/drilldown`
- **PieChart / Gauge** → `/admin/ocupacion`
- **Heatmap** → `/admin/reservas/heatmap`

## ⚠️ Notas Importantes

1. **Autenticación**: Todos los endpoints requieren token JWT con rol `admin`
2. **Interceptors**: Usar axios interceptors para agregar `Authorization` automáticamente
3. **Loading**: Mostrar loader mientras cargan (algunas agregaciones SQL son grandes)
4. **Zona Horaria**: Usar siempre `America/Argentina/Cordoba` para consistencia
5. **Fechas**: Formato `YYYY-MM-DD` (ISO 8601)
6. **Caché**: Los datos pueden ser cacheados por 5 minutos para optimizar performance
