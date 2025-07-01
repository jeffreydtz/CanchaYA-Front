import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign } from "lucide-react"

const kpiData = [
  {
    title: "Ocupación mensual",
    value: "78%",
    change: "+5.2%",
    trend: "up",
    icon: Calendar,
    description: "vs mes anterior",
  },
  {
    title: "Cancelaciones",
    value: "12%",
    change: "-2.1%",
    trend: "down",
    icon: TrendingDown,
    description: "vs mes anterior",
  },
  {
    title: "Usuarios activos",
    value: "1,247",
    change: "+8.3%",
    trend: "up",
    icon: Users,
    description: "este mes",
  },
  {
    title: "Ingresos",
    value: "$2.4M",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "este mes",
  },
]

const reservationData = [
  { day: "Lun", reservas: 45 },
  { day: "Mar", reservas: 52 },
  { day: "Mié", reservas: 48 },
  { day: "Jue", reservas: 61 },
  { day: "Vie", reservas: 78 },
  { day: "Sáb", reservas: 95 },
  { day: "Dom", reservas: 67 },
]

const peakHoursData = [
  { hora: "08:00", ocupacion: 20 },
  { hora: "10:00", ocupacion: 35 },
  { hora: "12:00", ocupacion: 45 },
  { hora: "14:00", ocupacion: 60 },
  { hora: "16:00", ocupacion: 75 },
  { hora: "18:00", ocupacion: 95 },
  { hora: "20:00", ocupacion: 100 },
  { hora: "22:00", ocupacion: 85 },
]

const topCourts = [
  { name: "Club Atlético Central", reservas: 156, ocupacion: 89 },
  { name: "Complejo Norte", reservas: 142, ocupacion: 82 },
  { name: "Polideportivo Sur", reservas: 128, ocupacion: 76 },
  { name: "Tennis Club", reservas: 98, ocupacion: 65 },
  { name: "Futsal Arena", reservas: 87, ocupacion: 58 },
]

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de la actividad de la plataforma</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>{kpi.change}</span>
                  <span className="ml-1">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas por día</CardTitle>
            <CardDescription>Última semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reservationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reservas" fill="#0A8754" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Horas pico</CardTitle>
            <CardDescription>Ocupación promedio por horario</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ocupacion" stroke="#143642" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Courts */}
      <Card>
        <CardHeader>
          <CardTitle>Canchas más populares</CardTitle>
          <CardDescription>Ranking por número de reservas este mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCourts.map((court, index) => (
              <div key={court.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{court.name}</p>
                    <p className="text-sm text-muted-foreground">{court.reservas} reservas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24">
                    <Progress value={court.ocupacion} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{court.ocupacion}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
