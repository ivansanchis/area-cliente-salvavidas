// src/components/admin/UserSearch.tsx - BUSCADOR AJAX

"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserSearchProps {
  onSearchResults?: (users: any[]) => void
  onClearSearch?: () => void
}

export default function UserSearch({ onSearchResults, onClearSearch }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm.trim())
      } else {
        // Clear search when input is empty
        onClearSearch?.()
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const performSearch = async (query: string) => {
    if (query.length < 2) return // Don't search for less than 2 characters

    setIsSearching(true)
    
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const results = await response.json()
        onSearchResults?.(results)
      } else {
        console.error('Search failed:', response.status)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    onClearSearch?.()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar usuarios por email, nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
}