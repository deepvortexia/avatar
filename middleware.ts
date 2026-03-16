import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const CHUNK_SIZE = 3000
const STORAGE_KEY = 'deepvortex-auth'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return supabaseResponse

  // Helper to get chunked cookie from request
  const getChunkedCookie = (name: string): string | undefined => {
    const single = request.cookies.get(name)?.value
    if (single) return single

    let result = ''
    let index = 0
    while (true) {
      const chunk = request.cookies.get(`${name}.${index}`)?.value
      if (!chunk) break
      result += chunk
      index++
    }
    return result || undefined
  }

  const projectId = supabaseUrl.match(/sb-([^.]+)/)?.[1] || ''

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookies = request.cookies.getAll()
        const result: { name: string; value: string }[] = []
        const processedBases = new Set<string>()

        for (const cookie of cookies) {
          // Check if it's a chunk
          const chunkMatch = cookie.name.match(/^(.+)\.(\d+)$/)
          if (chunkMatch) {
            const baseName = chunkMatch[1]
            if (!processedBases.has(baseName)) {
              processedBases.add(baseName)
              const fullValue = getChunkedCookie(baseName)
              if (fullValue) {
                result.push({ name: baseName, value: fullValue })
              }
            }
          } else if (!processedBases.has(cookie.name)) {
            result.push(cookie)
          }
        }

        // Map our shared key to what Supabase expects
        const sharedAuth = getChunkedCookie(STORAGE_KEY)
        if (sharedAuth) {
          const supabaseKey = `sb-${projectId}-auth-token`
          if (!result.find(c => c.name === supabaseKey)) {
            result.push({ name: supabaseKey, value: sharedAuth })
          }
        }

        // Map code-verifier: check all possible naming conventions
        const supabaseVerifierKey = `sb-${projectId}-auth-token-code-verifier`
        if (!result.find(c => c.name === supabaseVerifierKey)) {
          // Convention used by Vite apps (Hub, Emoticon):
          const sharedVerifier = getChunkedCookie(`${STORAGE_KEY}-code-verifier`)
          if (sharedVerifier) {
            result.push({ name: supabaseVerifierKey, value: sharedVerifier })
          }
        }

        return result
      },

      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = {
            ...options,
            domain: '.deepvortexai.art',
            path: '/',
            sameSite: 'lax' as const,
            secure: true,
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 365,
          }

          // Map Supabase's cookie to our shared key
          let targetName = name
          if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
            targetName = STORAGE_KEY
          } else if (name.includes('code-verifier')) {
            // Always use a consistent name for code-verifier across all apps
            targetName = `${STORAGE_KEY}-code-verifier`
          }

          // Remove existing chunks
          let i = 0
          while (request.cookies.get(`${targetName}.${i}`)) {
            supabaseResponse.cookies.set(`${targetName}.${i}`, '', { ...cookieOptions, maxAge: 0 })
            i++
          }
          supabaseResponse.cookies.set(targetName, '', { ...cookieOptions, maxAge: 0 })

          if (value.length <= CHUNK_SIZE) {
            supabaseResponse.cookies.set(targetName, value, cookieOptions)
            return
          }

          const chunks = Math.ceil(value.length / CHUNK_SIZE)
          for (let i = 0; i < chunks; i++) {
            const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
            supabaseResponse.cookies.set(`${targetName}.${i}`, chunk, cookieOptions)
          }
        })
      },
    },
  })

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
