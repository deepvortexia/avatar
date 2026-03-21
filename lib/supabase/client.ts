// lib/supabase/client.ts (Image Generator — Next.js)
import { createBrowserClient } from '@supabase/ssr'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null
const CHUNK_SIZE = 3000

// The shared cookie key used across all 3 sites
const STORAGE_KEY = 'deepvortex-auth'

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

const setCookieRaw = (name: string, value: string, maxAge: number = 31536000) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; domain=.deepvortexai.com; path=/; max-age=${maxAge}; secure; samesite=lax`
}

const removeCookieRaw = (name: string) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; domain=.deepvortexai.com; path=/; max-age=0; secure; samesite=lax`
}

// Get chunked or single cookie value
const getChunkedCookie = (name: string): string | undefined => {
  const singleValue = getCookie(name)
  if (singleValue) return singleValue

  let result = ''
  let index = 0
  while (true) {
    const chunk = getCookie(`${name}.${index}`)
    if (!chunk) break
    result += chunk
    index++
  }
  return result || undefined
}

// Set chunked cookie
const setChunkedCookie = (name: string, value: string, maxAge: number = 31536000) => {
  // Remove existing
  let i = 0
  while (getCookie(`${name}.${i}`)) { removeCookieRaw(`${name}.${i}`); i++ }
  removeCookieRaw(name)

  if (value.length <= CHUNK_SIZE) {
    setCookieRaw(name, value, maxAge)
    return
  }

  const chunks = Math.ceil(value.length / CHUNK_SIZE)
  for (let i = 0; i < chunks; i++) {
    const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    setCookieRaw(`${name}.${i}`, chunk, maxAge)
  }
}

// Remove chunked cookie
const removeChunkedCookie = (name: string) => {
  removeCookieRaw(name)
  let i = 0
  while (getCookie(`${name}.${i}`)) { removeCookieRaw(`${name}.${i}`); i++ }
}

export function createClient() {
  if (clientInstance) return clientInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') console.warn('⚠️ Supabase configuration missing')
    return null as any
  }

  clientInstance = createBrowserClient(url, key, {
    cookies: {
      get(name: string) {
        // Map Supabase's default cookie name to our shared key
        if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
          const value = getChunkedCookie(STORAGE_KEY)
          if (value) {
            // Guard: if the stored value is a base64 string (old Supabase format)
            // rather than valid JSON, _recoverAndRefresh will throw.
            // Clear it and return undefined so Supabase starts a clean session.
            try {
              JSON.parse(value)
              return value
            } catch {
              console.warn('[auth] Corrupted/base64 session found — clearing storage to prevent crash loop')
              removeChunkedCookie(STORAGE_KEY)
              return undefined
            }
          }
        }
        // Code verifier: try sessionStorage first (most reliable for same-tab auth),
        // then fall back to cookies. Use the shared name across all apps.
        if (name.includes('code-verifier')) {
          const sharedName = `${STORAGE_KEY}-code-verifier`
          try {
            const ss = sessionStorage.getItem(sharedName)
            if (ss) return ss
          } catch {}
          const value = getChunkedCookie(sharedName)
          if (value) return value
          return getChunkedCookie(name)
        }
        return getChunkedCookie(name)
      },

      set(name: string, value: string, options?: { maxAge?: number }) {
        const maxAge = options?.maxAge || 31536000

        if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
          setChunkedCookie(STORAGE_KEY, value, maxAge)
          return
        }
        // Code verifier: store in both sessionStorage (reliable) and cookies (cross-domain)
        if (name.includes('code-verifier')) {
          const sharedName = `${STORAGE_KEY}-code-verifier`
          try { sessionStorage.setItem(sharedName, value) } catch {}
          setChunkedCookie(sharedName, value, maxAge)
          return
        }
        setChunkedCookie(name, value, maxAge)
      },

      remove(name: string) {
        if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
          removeChunkedCookie(STORAGE_KEY)
          return
        }
        if (name.includes('code-verifier')) {
          const sharedName = `${STORAGE_KEY}-code-verifier`
          try { sessionStorage.removeItem(sharedName) } catch {}
          removeChunkedCookie(sharedName)
          return
        }
        removeChunkedCookie(name)
      }
    }
  })

  return clientInstance
}
