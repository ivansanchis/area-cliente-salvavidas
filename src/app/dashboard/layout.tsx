import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar fijo a la izquierda */}
        <Sidebar />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header superior */}
          <Header />
          
          {/* Contenido de la página con fondo gris y contenedor centrado */}
          <main className="flex-1 bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}