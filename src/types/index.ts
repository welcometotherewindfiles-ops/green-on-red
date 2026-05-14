// ============================================================
// Green on Red — Shared TypeScript Types
// ============================================================

export type UserRole = 'admin' | 'member'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type ContentType = 'post' | 'link' | 'file'

export type CategorySlug =
  | 'strategies'
  | 'fundamentals'
  | 'risk-management'
  | 'brokerages'
  | 'backtesting'
  | 'automation'

export interface Category {
  id: string
  name: string
  slug: CategorySlug
  description: string | null
  icon: string | null
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  meeting_date: string
  format: 'in-person' | 'online' | 'hybrid'
  location: string | null
  zoom_link: string | null
  notes: string | null
  presentation_url: string | null
  recording_url: string | null
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  title: string
  content_type: ContentType
  body: string | null          // rich text HTML for posts
  url: string | null           // external URL for links
  file_url: string | null      // Supabase storage URL for files
  file_name: string | null
  description: string | null
  published_at: string
  created_at: string
  updated_at: string
  // Relations (joined)
  categories?: Category[]
  meetings?: Meeting[]
}

export interface ContentItemWithRelations extends ContentItem {
  categories: Category[]
  meetings: Meeting[]
}

// Junction tables
export interface ContentCategory {
  content_item_id: string
  category_id: string
}

export interface ContentMeeting {
  content_item_id: string
  meeting_id: string
}
