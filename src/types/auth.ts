export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name: string
  display_name?: string
  profile_picture?: string
  auth_method: 'email' | 'google'
  email_verified: boolean
  is_active: boolean
  credits_balance: number
  total_credits_purchased: number
  current_plan: 'free' | 'starter' | 'professional' | 'business' | 'enterprise'
  last_login?: string
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface SigninRequest {
  email: string
  password: string
}

export interface SigninResponse {
  success: boolean
  message: string
  access_token: string
  refresh_token: string
  user: User
  expires_in: number
}

export interface SignupRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  age_confirmed: boolean
  agreed_to_terms: boolean
}

export interface SignupResponse {
  success: boolean
  message: string
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    email_verified: boolean
  }
  verification_email_sent: boolean
  next_step: string
}

export interface GoogleAuthRequest {
  id_token: string
  age_confirmed?: boolean
  agreed_to_terms?: boolean
}

export interface GoogleAuthResponse {
  success: boolean
  message: string
  access_token?: string
  refresh_token?: string
  user?: User
  expires_in?: number
  signup_required?: boolean
  next_step?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  success: boolean
  access_token: string
  expires_in: number
}

// Validation errors
export interface ValidationError {
  field: string
  message: string
}

export interface AuthError {
  message: string
  details?: Record<string, string>
  validation_errors?: ValidationError[]
}

// Session management
export interface UserSession {
  id: string
  ip_address?: string
  device_info?: string
  is_active: boolean
  created_at: string
  last_activity: string
  expires_at: string
}

export interface SessionsResponse {
  success: boolean
  sessions: UserSession[]
}