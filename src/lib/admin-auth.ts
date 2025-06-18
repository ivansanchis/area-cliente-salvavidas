import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 Authorize called with:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.active) {
          console.log('❌ User not found or inactive')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('❌ Invalid password')
          return null
        }
        
        console.log('✅ Login successful for user:', {
          email: user.email,
          accessType: user.accessType,
          accessId: user.accessId
        })
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          accessType: user.accessType,
          accessId: user.accessId,
          canViewContratos: user.canViewContratos,
          canViewFormaciones: user.canViewFormaciones,
          canViewFacturas: user.canViewFacturas,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    // ✅ AÑADIR configuración específica
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  // ✅ CONFIGURACIÓN JWT específica para evitar problemas de encriptación
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
    // ✅ FORZAR algoritmo específico para evitar problemas
    encode: async ({ token, secret }) => {
      const jwt = require('jsonwebtoken')
      return jwt.sign(token, secret, { algorithm: 'HS256' })
    },
    decode: async ({ token, secret }) => {
      const jwt = require('jsonwebtoken')
      try {
        return jwt.verify(token, secret, { algorithms: ['HS256'] })
      } catch (error) {
        console.error('JWT decode error:', error)
        return null
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔧 JWT callback - user:', user)
      console.log('🔧 JWT callback - token:', token)
      
      if (user) {
        token.accessType = user.accessType
        token.accessId = user.accessId
        token.canViewContratos = user.canViewContratos
        token.canViewFormaciones = user.canViewFormaciones
        token.canViewFacturas = user.canViewFacturas
      }
      return token
    },
    async session({ session, token }) {
      console.log('🔧 Session callback - token:', token)
      console.log('🔧 Session callback - session before:', session)
      
      if (session?.user) {
        session.user.id = token.sub!
        session.user.accessType = token.accessType as string
        session.user.accessId = token.accessId as string
        session.user.canViewContratos = token.canViewContratos as boolean
        session.user.canViewFormaciones = token.canViewFormaciones as boolean
        session.user.canViewFacturas = token.canViewFacturas as boolean
      }
      
      console.log('🔧 Session callback - session after:', session)
      return session
    }
  },
  // ✅ CONFIGURACIÓN de cookies específica
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // ✅ false para desarrollo local
        domain: undefined // ✅ undefined para localhost
      }
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // ✅ DESACTIVAR debug en producción, mantener en desarrollo
  debug: process.env.NODE_ENV === 'development',
}