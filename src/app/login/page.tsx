"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Heart } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email o contraseña incorrectos")
      } else {
        // Login exitoso, redirigir al dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título principal */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/images/logo-dark.svg"
                alt="Salvavidas Cardio"
                width={200}
                height={60}
                className="h-16 w-auto"
                priority
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Área de Cliente
            </h1>
            <p className="text-gray-600">
              Salvavidas Cardio - Accede a tu información
            </p>
          </div>
        </div>

        {/* Formulario de login */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl text-center font-semibold">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Introduce tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-base focus:ring-2 focus:ring-primary/20 border-gray-200"
                  disabled={isLoading}
                />
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-base focus:ring-2 focus:ring-primary/20 border-gray-200"
                  disabled={isLoading}
                />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            Protegemos el <Heart className="h-4 w-4 text-red-500 fill-current" /> de tu empresa
          </p>
        </div>
      </div>
    </div>
  )
}