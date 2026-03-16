export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  credits: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  pack_name: string
  amount_cents: number
  credits_purchased: number
  status: string
  created_at: string
}

export interface ImageRecord {
  id: string
  user_id: string
  prompt: string
  image_url: string
  aspect_ratio: string | null
  is_favorite: boolean
  created_at: string
}
