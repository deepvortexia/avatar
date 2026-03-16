'use client';

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export const useCredits = () => {
  const { profile, refreshProfile, loading } = useAuth()

  const hasCredits = profile && profile.credits > 0

  const getCredits = () => {
    return profile?.credits || 0
  }

  // Debug logging for credits state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('💰 useCredits: Profile changed', { 
        hasProfile: !!profile,
        credits: profile?.credits || 0,
        email: profile?.email || 'null'
      })
    }
  }, [profile])

  const deductCredit = async () => {
    if (!profile) return false
    
    try {
      // The API will handle the actual deduction on the server side
      // This just triggers a refresh after the API call
      await refreshProfile()
      return true
    } catch (error) {
      console.error('Error deducting credit:', error)
      return false
    }
  }

  return {
    credits: getCredits(),
    hasCredits,
    deductCredit,
    refreshProfile,
    loading,
  }
}
