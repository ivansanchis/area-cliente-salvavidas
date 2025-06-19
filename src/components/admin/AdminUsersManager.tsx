// src/components/admin/AdminUsersManager.tsx - CONECTA BUSCADOR Y TABLA

"use client"

import { useState } from 'react'
import UserSearch from './UserSearch'
import UsersTable from './UsersTable'

interface User {
  id: string
  email: string
  nombre?: string | null
  apellidos?: string | null
  name?: string | null
  accessType: string
  accessId: string
  active: boolean
  canViewContratos: boolean
  canViewFormaciones: boolean
  canViewFacturas: boolean
  grupo?: { nome: string } | null
  empresa?: { nombreCliente: string } | null
}

interface AdminUsersManagerProps {
  initialUsers: User[]
}

export default function AdminUsersManager({ initialUsers }: AdminUsersManagerProps) {
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers)
  const [displayedUsers, setDisplayedUsers] = useState<User[]>(initialUsers)

  const handleSearchResults = (searchResults: User[]) => {
    console.log('🔍 Search results received:', searchResults.length)
    setDisplayedUsers(searchResults)
  }

  const handleClearSearch = () => {
    console.log('🔄 Clearing search, showing all users')
    setDisplayedUsers(allUsers)
  }

  const handleUserUpdate = (updatedUser: User) => {
    console.log('🔄 Updating user:', updatedUser.email)
    
    // Actualizar en ambas listas
    const updateUserInArray = (users: User[]) => 
      users.map(user => user.id === updatedUser.id ? updatedUser : user)
    
    setAllUsers(updateUserInArray)
    setDisplayedUsers(updateUserInArray)
  }

  const handleUserRemove = (userId: string) => {
    console.log('🗑️ Removing user:', userId)
    
    // Remover de ambas listas
    const removeUserFromArray = (users: User[]) => 
      users.filter(user => user.id !== userId)
    
    setAllUsers(removeUserFromArray)
    setDisplayedUsers(removeUserFromArray)
  }

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="flex justify-end">
        <div className="w-80">
          <UserSearch 
            onSearchResults={handleSearchResults}
            onClearSearch={handleClearSearch}
          />
        </div>
      </div>

      {/* Tabla */}
      <UsersTable 
        users={displayedUsers}
        onUserUpdate={handleUserUpdate}
        onUserRemove={handleUserRemove}
      />
    </div>
  )
}