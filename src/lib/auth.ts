import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.active) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

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
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
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
      if (session?.user) {
        session.user.id = token.sub!
        session.user.accessType = token.accessType as string
        session.user.accessId = token.accessId as string
        session.user.canViewContratos = token.canViewContratos as boolean
        session.user.canViewFormaciones = token.canViewFormaciones as boolean
        session.user.canViewFacturas = token.canViewFacturas as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}