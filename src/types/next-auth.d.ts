import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessType: string
      accessId: string
      canViewContratos: boolean
      canViewFormaciones: boolean
      canViewFacturas: boolean
    }
  }

  interface User {
    accessType: string
    accessId: string
    canViewContratos: boolean
    canViewFormaciones: boolean
    canViewFacturas: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessType: string
    accessId: string
    canViewContratos: boolean
    canViewFormaciones: boolean
    canViewFacturas: boolean
  }
}