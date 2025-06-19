"use client"

import { useSession, signOut } from "next-auth/react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, ChevronDown } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  const handleEditProfile = () => {
    // TODO: Implementar edición de perfil
    console.log("Editar perfil")
  }

  // Función para obtener las iniciales del usuario
  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return "U"
  }

  // Función para obtener el nombre de display
  const getDisplayName = (name?: string | null, email?: string | null) => {
    return name || email?.split("@")[0] || "Usuario"
  }

  if (!session?.user) {
    return null
  }

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-end px-6">
      <div className="flex items-center space-x-4">
        {/* Dropdown de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-10 px-3 hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {getUserInitials(session.user.name, session.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {getDisplayName(session.user.name, session.user.email)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user.accessType}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="pb-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getDisplayName(session.user.name, session.user.email)}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={handleEditProfile}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Editar perfil</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}