'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      if (!supabase) {
        setError('Supabase not initialized')
        return
      }

      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const errorParam = url.searchParams.get('error')
      const errorDescription = url.searchParams.get('error_description')

      if (errorParam) {
        setError(errorDescription || errorParam)
        return
      }

      // PKCE flow: exchange authorization code for session
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          // If code verifier was lost, check if detectSessionInUrl already handled it
          if (exchangeError.message.includes('code verifier')) {
            const { data: sessionData } = await supabase.auth.getSession()
            if (sessionData?.session) {
              window.location.replace('/')
              return
            }
            setError('Session expired. Please try signing in again.')
            return
          }
          setError(exchangeError.message)
          return
        }

        window.location.replace('/')
        return
      }

      // Implicit flow fallback: check hash for access_token (magic link)
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        await supabase.auth.getSession()
        window.location.replace('/')
        return
      }

      // Fallback: check if session already exists
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData?.session) {
        window.location.replace('/')
        return
      }

      // Safety timeout
      setTimeout(() => {
        window.location.replace('/')
      }, 3000)
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0a0a', color: '#ff4444',
        fontFamily: 'Orbitron, sans-serif', flexDirection: 'column', gap: '1rem',
        padding: '2rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem' }}>&#x26A0;&#xFE0F;</div>
        <p style={{ maxWidth: '400px' }}>Sign in failed: {error}</p>
        <a href="/" style={{ color: '#D4AF37', textDecoration: 'underline', marginTop: '1rem' }}>
          Return to Home
        </a>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '0.5rem', padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #D4AF37, #B8960C)',
            border: 'none', borderRadius: '8px', color: '#0a0a0a',
            fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0a0a0a', color: '#D4AF37',
      fontFamily: 'Orbitron, sans-serif', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{ fontSize: '2rem' }}>&#x26A1;</div>
      <p>Completing sign in...</p>
    </div>
  )
}
