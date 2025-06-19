"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard,
  MapPin,
  GraduationCap,
  Monitor,
  FileText,
  Download,
  MessageCircle,
  Headphones,
  AlertTriangle,
  Users,
  Phone,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermissions?: string[]
  adminOnly?: boolean
}

const mainNavigation: NavigationItem[] = [
  {
    label: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Dispositivos",
    href: "/dashboard/dispositivos",
    icon: MapPin,
  },
  {
    label: "Formaciones",
    href: "/dashboard/formaciones",
    icon: GraduationCap,
    requiredPermissions: ["canViewFormaciones"],
  },
  {
    label: "Formación Online",
    href: "/dashboard/formacion-online",
    icon: Monitor,
    requiredPermissions: ["canViewFormaciones"],
  },
  {
    label: "Mis Contratos",
    href: "/dashboard/contratos",
    icon: FileText,
    requiredPermissions: ["canViewContratos"],
  },
  {
    label: "Descargables",
    href: "/dashboard/descargables",
    icon: Download,
  },
  {
    label: "Contacto",
    href: "/dashboard/contacto",
    icon: MessageCircle,
  },
]

const supportNavigation: NavigationItem[] = [
  {
    label: "Servicio técnico",
    href: "/dashboard/soporte/tecnico",
    icon: Headphones,
  },
  {
    label: "Reporta un suceso",
    href: "/dashboard/soporte/incidencia",
    icon: AlertTriangle,
  },
  {
    label: "Contacta con tu asesor",
    href: "/dashboard/soporte/asesor",
    icon: Users,
  },
  {
    label: "Atención al cliente",
    href: "/dashboard/soporte/atencion",
    icon: Phone,
  },
]

const adminNavigation: NavigationItem[] = [
  {
    label: "Administración",
    href: "/dashboard/admin",
    icon: Settings,
    adminOnly: true,
  },
]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Función para verificar si el usuario tiene los permisos necesarios
  const hasPermissions = (requiredPermissions?: string[]) => {
    if (!requiredPermissions || !session?.user) return true
    
    return requiredPermissions.every(permission => {
      switch (permission) {
        case "canViewContratos":
          return session.user.canViewContratos
        case "canViewFormaciones":
          return session.user.canViewFormaciones
        case "canViewFacturas":
          return session.user.canViewFacturas
        default:
          return true
      }
    })
  }

  // Verificar si es administrador
  const isAdmin = session?.user?.accessType === "ADMIN"

  // Filtrar navegación según permisos
  const filteredMainNav = mainNavigation.filter(item => hasPermissions(item.requiredPermissions))
  const filteredAdminNav = adminNavigation.filter(item => !item.adminOnly || isAdmin)

  // Componente de enlace de navegación
  const NavLink = ({ item, isActive }: { item: NavigationItem; isActive: boolean }) => {
    const Icon = item.icon
    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center rounded-lg transition-all duration-200",
          isCollapsed ? "px-3 py-3 justify-center" : "px-2 py-3 2xl:py-3.5",
          "text-sm 2xl:text-base",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5")} />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return linkContent
  }

  // Componente de botón de soporte
  const SupportButton = ({ item }: { item: NavigationItem }) => {
    const Icon = item.icon
    const buttonContent = (
      <button
        className={cn(
          "w-full flex items-center rounded-lg transition-all duration-200",
          isCollapsed ? "px-3 py-2.5 justify-center" : "px-2 py-2.5 2xl:py-3",
          "text-sm 2xl:text-base text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        onClick={() => {
          // TODO: Implementar lógica de contacto/soporte
          console.log(`Contactar: ${item.label}`)
        }}
      >
        <Icon className={cn("flex-shrink-0", isCollapsed ? "h-4 w-4" : "mr-3 h-4 w-4")} />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </button>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return buttonContent
  }

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-all duration-300 dark",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo y botón de toggle */}
      <div className={cn(
        "border-b border-sidebar-border flex items-center",
        isCollapsed ? "p-3 justify-center" : "p-6 justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="block">
            <Image
              src="/images/logo-dark.svg"
              alt="Salvavidas Cardio"
              width={180}
              height={40}
              className="h-12 w-auto dark:hidden"
              priority
            />
            <Image
              src="/images/logo-light.svg"
              alt="Salvavidas Cardio"
              width={180}
              height={40}
              className="h-12 w-auto hidden dark:block"
              priority
            />
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "h-10 w-10"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navegación principal */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className={cn("flex-1 py-6 space-y-1", isCollapsed ? "px-2" : "px-4")}>
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
                MENÚ PRINCIPAL
              </h3>
            )}
            <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
              {filteredMainNav.map((item) => {
                const isActive = pathname === item.href
                return <NavLink key={item.href} item={item} isActive={isActive} />
              })}
            </div>
          </div>

          {/* Navegación de administración */}
          {filteredAdminNav.length > 0 && (
            <div className="mb-6">
              {!isCollapsed && (
                <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
                  ADMINISTRACIÓN
                </h3>
              )}
              <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
                {filteredAdminNav.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return <NavLink key={item.href} item={item} isActive={isActive} />
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Navegación de soporte - parte inferior */}
        <div className={cn(
          "border-t border-sidebar-border py-4",
          isCollapsed ? "px-2" : "px-4"
        )}>
          {!isCollapsed && (
            <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
              AYUDA Y SOPORTE
            </h3>
          )}
          <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
            {supportNavigation.map((item) => (
              <SupportButton key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}