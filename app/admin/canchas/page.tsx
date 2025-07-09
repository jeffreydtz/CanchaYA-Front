"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, MapPin, DollarSign, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiClient, { Court } from "@/lib/api-client"

export default function AdminCanchasPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCourts()
  }, [])

  const loadCourts = async () => {
    try {
      const response = await apiClient.getCourts()
      if (response.data) {
        setCourts(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las canchas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCourts = courts.filter(
    (court) =>
      court.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.club.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.deporte.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const CourtForm = ({ court, onClose }: { court?: Court | null; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      nombre: court?.nombre || "",
      descripcion: court?.descripcion || "",
      precio: court?.precio || 0,
      disponible: court?.disponible ?? true,
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      // Here you would normally call the API to create/update the court
      // For now, we'll just show a success message
      toast({
        title: court ? "Cancha actualizada" : "Cancha creada",
        description: `La cancha ${formData.nombre} ha sido ${court ? "actualizada" : "creada"} exitosamente.`,
      })
      
      onClose()
      loadCourts()
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la cancha</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Cancha de Fútbol 5 #1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precio">Precio por hora</Label>
            <Input
              id="precio"
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
              placeholder="8000"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe las características de la cancha..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="disponible"
            checked={formData.disponible}
            onCheckedChange={(checked) => setFormData({ ...formData, disponible: checked })}
          />
          <Label htmlFor="disponible">Cancha disponible para reservas</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {court ? "Actualizar" : "Crear"} cancha
          </Button>
        </div>
      </form>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Canchas</h1>
          <p className="text-muted-foreground">Administra las canchas del sistema</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando canchas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Canchas</h1>
          <p className="text-muted-foreground">Administra las canchas del sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cancha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear nueva cancha</DialogTitle>
              <DialogDescription>
                Completa la información para crear una nueva cancha.
              </DialogDescription>
            </DialogHeader>
            <CourtForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Canchas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {courts.filter(c => c.disponible).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Disponibles</CardTitle>
            <MapPin className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {courts.filter(c => !c.disponible).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(courts.reduce((sum, court) => sum + court.precio, 0) / courts.length || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canchas por nombre, club o deporte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Courts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Canchas ({filteredCourts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Deporte</TableHead>
                <TableHead>Precio/hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell className="font-medium">{court.nombre}</TableCell>
                  <TableCell>{court.club.nombre}</TableCell>
                  <TableCell>{court.deporte.nombre}</TableCell>
                  <TableCell>{formatPrice(court.precio)}</TableCell>
                  <TableCell>
                    <Badge variant={court.disponible ? "default" : "secondary"}>
                      {court.disponible ? "Disponible" : "No disponible"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCourt(court)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar cancha</DialogTitle>
                            <DialogDescription>
                              Modifica la información de la cancha.
                            </DialogDescription>
                          </DialogHeader>
                          <CourtForm 
                            court={editingCourt} 
                            onClose={() => setEditingCourt(null)} 
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Función no disponible",
                            description: "La eliminación de canchas estará disponible próximamente.",
                            variant: "destructive",
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCourts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No se encontraron canchas con ese criterio" : "No hay canchas registradas"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 