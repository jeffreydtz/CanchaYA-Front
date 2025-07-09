"use client"

import dynamic from "next/dynamic"

// Dynamically import AdminDashboard with SSR disabled to fix recharts SSR issues
const AdminDashboard = dynamic(
  () => import("@/components/admin/admin-dashboard").then((mod) => ({ default: mod.AdminDashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    )
  }
)

export default function AdminPage() {
  return <AdminDashboard />
}
