// User dashboard and stats types
export interface User {
  id: string
  email: string
  name: string
  first_name?: string
  last_name?: string
  age_confirmed: boolean
  agreed_to_terms: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
  profile_picture?: string
  is_admin: boolean
  is_verified: boolean
  is_active: boolean
}

export interface UserStats {
  total_channels: number
  channels_with_metadata: number
  total_videos: number
  user_stats: {
    credits_balance: number
    total_credits_purchased: number
    current_plan: string
    api_usage_today: number
  }
}

export interface Channel {
  id: string
  channel_id: string
  title?: string
  description?: string
  subscriber_count?: number
  video_count?: number
  view_count?: number
  country?: string
  language?: string
  custom_url?: string
  published_at?: string
  thumbnail_url?: string
  banner_url?: string
  keywords?: string[]
  topic_categories?: string[]
  metadata_fetched: boolean
  videos_fetched: boolean
  discovery_processed: boolean
  source: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  video_id: string
  channel_id: string
  channel_external_id: string
  title?: string
  description?: string
  published_at?: string
  duration?: string
  view_count?: number
  like_count?: number
  comment_count?: number
  thumbnail_url?: string
  tags?: string[]
  category_id?: number
  language?: string
  created_at: string
  updated_at: string
}

export interface ProcessingJob {
  job_id: string
  job_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  total_items?: number
  processed_items?: number
  progress?: number
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface ChannelDiscovery {
  id: string
  source_channel_id: string
  discovered_channel_id: string
  discovery_method: string
  service_name: string
  confidence_score?: number
  already_exists: boolean
  created_at: string
}

// API Request/Response types
export interface ChannelsResponse {
  channels: Channel[]
  total: number
  pages: number
  current_page: number
  per_page: number
}

export interface JobsResponse {
  jobs: ProcessingJob[]
}

export interface DiscoverChannelsRequest {
  channel_ids: string[]
  methods?: string[]
  limit?: number
}

export interface DiscoverChannelsResponse {
  job_id: string
  task_id: string
  status: string
  message: string
  estimated_credits?: number
  discovery_methods?: string[]
}

export interface FetchMetadataRequest {
  channel_ids?: string[]
  limit?: number
}

export interface FetchMetadataResponse {
  job_id: string
  task_id: string
  status: string
  message: string
}

export interface FetchVideosRequest {
  channel_ids?: string[]
  videos_per_channel?: number
  limit?: number
}

export interface FetchVideosResponse {
  job_id: string
  task_id: string
  status: string
  message: string
}

export interface BatchProcessRequest {
  batch_size?: number
  total_limit?: number
}

export interface BatchProcessResponse {
  job_id: string
  task_id: string
  status: string
  message: string
  estimated_batches?: string | number
}

// Credit and payment types
export interface CreditPackage {
  id: string
  name: string
  credits: number
  price_usd: number
  description: string
  features: string[]
}

export interface CreditPackagesResponse {
  packages: Record<string, CreditPackage>
  free_tier: {
    credits: number
    renewable: string
    description: string
  }
  pricing_notes: {
    currency: string
    channel_discovery: string
    full_analysis: string
    batch_processing: string
    payment_info: string
    max_single_purchase: string
  }
  larger_packages: {
    note: string
    email: string
    enterprise_pricing: string
  }
}

export interface UserCredits {
  user: {
    email: string
    name: string
    credits_balance: number
    total_purchased: number
    created_at: string
  }
  transactions: CreditTransaction[]
}

export interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage' | 'refund' | 'free_reset'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  payment_reference?: string
  amount_usd?: number
  created_at: string
}

export interface PurchaseCreditsRequest {
  package_id: string
  email: string
}

export interface PurchaseCreditsResponse {
  success: boolean
  checkout_url: string
  reference: string
  package: CreditPackage & { id: string }
  amount_ngn: number
  instructions: string
}

// Rate limiting types
export interface RateLimitError {
  error: string
  limit_type: string
  window: string
  current_usage: number
  max_allowed: number
  retry_after: number
  message: string
}

export interface InsufficientCreditsError {
  error: string
  credits_needed: number
  credits_available: number
  message: string
}

// System health types
export interface SystemHealth {
  status: string
  timestamp: string
  version: string
  features: {
    authentication: boolean
    rate_limiting: boolean
    credit_system: boolean
    google_oauth: boolean
    email_service: boolean
  }
}