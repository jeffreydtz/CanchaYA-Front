// API Client for CanchaYA Frontend
// Handles all API communication with the backend

export interface Court {
    id: string
    nombre: string
    deporte: string
    club: string
    direccion: string
    precio: number
    imagen: string
    descripcion: string
    horarios: string
    telefono: string
    email: string
    featured?: boolean
}

export interface Reservation {
    id: string
    courtId: string
    userId: string
    fecha: string
    hora: string
    duracion: number
    precio: number
    estado: 'pendiente' | 'confirmada' | 'cancelada'
    court?: Court
    user?: User
}

export interface User {
    id: string
    nombre: string
    email: string
    telefono: string
    rol: 'usuario' | 'admin'
}

export interface Notification {
    id: string
    userId: string
    titulo: string
    mensaje: string
    leida: boolean
    fecha: string
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export interface CourtFilters {
    deporte?: string
    club?: string
    fecha?: string
    featured?: boolean
}

export interface ReservationData {
    courtId: string
    fecha: string
    hora: string
    duracion: number
    email?: string
}

export interface LoginData {
    email: string
    password: string
}

export interface RegisterData {
    nombre: string
    email: string
    password: string
    telefono: string
}

export interface Stats {
    totalUsers: number
    totalCourts: number
    totalReservations: number
    totalRevenue: number
    recentGrowth: number
}

export interface Report {
    reservasTotales: number
    ingresosTotales: number
    ocupacionPromedio: number
    canchasMasReservadas: Array<{
        cancha: string
        reservas: number
    }>
}

// Mock data for development
const mockCourts: Court[] = [
    {
        id: '1',
        nombre: 'Cancha de Fútbol 1',
        deporte: 'Fútbol',
        club: 'Club Deportivo Central',
        direccion: 'Av. Principal 123',
        precio: 5000,
        imagen: '/placeholder.jpg',
        descripcion: 'Cancha profesional de fútbol 11 con césped sintético',
        horarios: 'Lun-Dom 8:00-22:00',
        telefono: '123-456-7890',
        email: 'info@clubcentral.com',
        featured: true,
    },
    {
        id: '2',
        nombre: 'Cancha de Tenis 1',
        deporte: 'Tenis',
        club: 'Club de Tenis Premium',
        direccion: 'Calle Deportiva 456',
        precio: 3000,
        imagen: '/placeholder.jpg',
        descripcion: 'Cancha de tenis profesional con superficie de arcilla',
        horarios: 'Lun-Dom 7:00-23:00',
        telefono: '098-765-4321',
        email: 'info@tenispremium.com',
        featured: true,
    },
    {
        id: '3',
        nombre: 'Cancha de Paddle 1',
        deporte: 'Paddle',
        club: 'Club Paddle Elite',
        direccion: 'Boulevard Deportivo 789',
        precio: 2500,
        imagen: '/placeholder.jpg',
        descripcion: 'Cancha de paddle con paredes de cristal',
        horarios: 'Lun-Dom 9:00-21:00',
        telefono: '555-123-4567',
        email: 'info@paddleelite.com',
        featured: false,
    },
]

const mockReservations: Reservation[] = [
    {
        id: '1',
        courtId: '1',
        userId: 'user1',
        fecha: '2024-01-15',
        hora: '14:00',
        duracion: 2,
        precio: 5000,
        estado: 'confirmada',
        court: mockCourts[0],
    },
]

const mockUsers: User[] = [
    {
        id: 'user1',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '123-456-7890',
        rol: 'usuario',
    },
]

const mockNotifications: Notification[] = [
    {
        id: '1',
        userId: 'user1',
        titulo: 'Reserva confirmada',
        mensaje: 'Tu reserva para el 15 de enero ha sido confirmada',
        leida: false,
        fecha: '2024-01-10T10:00:00Z',
    },
]

const apiClient = {
    // Court methods
    async getCourts(filters?: CourtFilters): Promise<ApiResponse<Court[]>> {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            let filteredCourts = [...mockCourts]

            if (filters) {
                if (filters.deporte) {
                    filteredCourts = filteredCourts.filter(court =>
                        court.deporte.toLowerCase().includes(filters.deporte!.toLowerCase())
                    )
                }
                if (filters.club) {
                    filteredCourts = filteredCourts.filter(court =>
                        court.club.toLowerCase().includes(filters.club!.toLowerCase())
                    )
                }
                if (filters.featured) {
                    filteredCourts = filteredCourts.filter(court => court.featured)
                }
            }

            return {
                success: true,
                data: filteredCourts,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener las canchas',
            }
        }
    },

    async getCourt(id: string): Promise<ApiResponse<Court>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            const court = mockCourts.find(c => c.id === id)
            if (!court) {
                return {
                    success: false,
                    error: 'Cancha no encontrada',
                }
            }

            return {
                success: true,
                data: court,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener la cancha',
            }
        }
    },

    // Reservation methods
    async createReservation(data: ReservationData): Promise<ApiResponse<Reservation>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newReservation: Reservation = {
                id: Date.now().toString(),
                courtId: data.courtId,
                userId: 'user1', // Mock user ID
                fecha: data.fecha,
                hora: data.hora,
                duracion: data.duracion,
                precio: 5000, // Mock price
                estado: 'pendiente',
            }

            return {
                success: true,
                data: newReservation,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al crear la reserva',
            }
        }
    },

    async getMyReservations(): Promise<ApiResponse<Reservation[]>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            return {
                success: true,
                data: mockReservations,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener las reservas',
            }
        }
    },

    async getAllReservations(): Promise<ApiResponse<Reservation[]>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            return {
                success: true,
                data: mockReservations,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener las reservas',
            }
        }
    },

    async cancelReservation(id: string): Promise<ApiResponse<boolean>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            return {
                success: true,
                data: true,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al cancelar la reserva',
            }
        }
    },

    // User methods
    async login(data: LoginData): Promise<ApiResponse<{ user: User; token: string }>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 800))

            const user = mockUsers.find(u => u.email === data.email)
            if (!user) {
                return {
                    success: false,
                    error: 'Credenciales inválidas',
                }
            }

            return {
                success: true,
                data: {
                    user,
                    token: 'mock-jwt-token',
                },
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al iniciar sesión',
            }
        }
    },

    async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newUser: User = {
                id: Date.now().toString(),
                nombre: data.nombre,
                email: data.email,
                telefono: data.telefono,
                rol: 'usuario',
            }

            return {
                success: true,
                data: {
                    user: newUser,
                    token: 'mock-jwt-token',
                },
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al registrarse',
            }
        }
    },

    async getUsers(): Promise<ApiResponse<User[]>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            return {
                success: true,
                data: mockUsers,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener usuarios',
            }
        }
    },

    // Notification methods
    async getNotifications(): Promise<ApiResponse<Notification[]>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            return {
                success: true,
                data: mockNotifications,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener notificaciones',
            }
        }
    },

    async markNotificationAsRead(id: string): Promise<ApiResponse<boolean>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            return {
                success: true,
                data: true,
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al marcar notificación como leída',
            }
        }
    },

    // Admin methods
    async getStats(): Promise<ApiResponse<Stats>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            return {
                success: true,
                data: {
                    totalUsers: 150,
                    totalCourts: 25,
                    totalReservations: 1200,
                    totalRevenue: 5000000,
                    recentGrowth: 15,
                },
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener estadísticas',
            }
        }
    },

    async getReports(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<Report>> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            return {
                success: true,
                data: {
                    reservasTotales: 1200,
                    ingresosTotales: 5000000,
                    ocupacionPromedio: 75,
                    canchasMasReservadas: [
                        { cancha: 'Cancha de Fútbol 1', reservas: 150 },
                        { cancha: 'Cancha de Tenis 1', reservas: 120 },
                        { cancha: 'Cancha de Paddle 1', reservas: 80 },
                    ],
                },
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener reportes',
            }
        }
    },
}

export default apiClient 