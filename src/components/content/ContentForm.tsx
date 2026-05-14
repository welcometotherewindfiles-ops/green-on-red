'use client'
// ============================================================
// ContentForm — shared add/edit form for all three content types.
// Switches fields based on type: Post / Link / File.
// Handles category multi-select and meeting association.
// ============================================================
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, X, Check } from 'lucide-react'
import { type ContentItem, type Category, type Meeting, type ContentType } from '@/types'
import { createContent, updateContent, type ContentFormData } from '@/app/actions/content'
import { RichTextEditor } from '@/components/content/RichTextEditor'
import { formatDate } from '@/lib/utils'

interface Props {
  item?: ContentItem & { categories: Category[]; meetings: Meeting[] }
  allCategories: Category[]
  allMeetings: Pick<Meeting, 'id' | 'title' | 'meeting_date'>[]
  defaultCategoryId?: string   // pre-select when coming from /library/[category]
  defaultMeetingId?: string    // pre-select when coming from /meetings/[id]
}

// ISO date for <input type="date"> from a full ISO timestamp
function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

export function ContentForm({
  item,
  allCategories,
  allMeetings,
  defaultCategoryId,
  defaultMeetingId,
}: Props) {
  const router = useRouter()
  const isEdit = !!item
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // ── Core fields ──────────────────────────────────────────────
  const [contentType, setContentType] = useState<ContentType>(item?.content_type ?? 'post')
  const [title, setTitle]             = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [publishedAt, setPublishedAt] = useState(
    item?.published_at ? toDateInput(item.published_at) : toDateInput(new Date().toISOString())
  )

  // ── Type-specific fields ─────────────────────────────────────
  const [body, setBody]         = useState(item?.body ?? '')
  const [url, setUrl]           = useState(item?.url ?? '')
  const [fileUrl, setFileUrl]   = useState(item?.file_url ?? '')
  const [fileName, setFileName] = useState(item?.file_name ?? '')

  // ── Relations ────────────────────────────────────────────────
  const initialCatIds = item?.categories.map(c => c.id) ??
    (defaultCategoryId ? [defaultCategoryId] : [])
  const initialMeetIds = item?.meetings.map(m => m.id) ??
    (defaultMeetingId ? [defaultMeetingId] : [])

  const [selectedCatIds, setSelectedCatIds]   = useState<string[]>(initialCatIds)
  const [selectedMeetIds, setSelectedMeetIds] = useState<string[]>(initialMeetIds)

  // ── Category toggle ──────────────────────────────────────────
  function toggleCategory(id: string) {
    setSelectedCatIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // ── Meeting toggle ───────────────────────────────────────────
  function toggleMeeting(id: string) {
    setSelectedMeetIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // ── Submit ───────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim())               { setError('Title is required.'); return }
    if (selectedCatIds.length === 0) { setError('Select at least one category.'); return }
    if (contentType === 'link' && !url.trim()) { setError('A URL is required for link content.'); return }

    const formData: ContentFormData = {
      title, content_type: contentType, description,
      body, url, file_url: fileUrl, file_name: fileName,
      category_ids: selectedCatIds,
      meeting_ids:  selectedMeetIds,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    }

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateContent(item!.id, formData)
        } else {
          await createContent(formData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  // ── Content type config ──────────────────────────────────────
  const TYPES: { value: ContentType; label: string; hint: string }[] = [
    { value: 'post', label: 'Post',  hint: 'A written article authored on this site' },
    { value: 'link', label: 'Link',  hint: 'An external URL — article, video, podcast' },
    { value: 'file', label: 'File',  hint: 'An uploaded PDF, spreadsheet, or slide deck' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-3 rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: '#fdf2f2', border: '1px solid #f5c6c6', color: '#c0392b' }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Content type selector ─────────────────────────────── */}
      <section>
        <FieldLabel>Content type</FieldLabel>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => !isEdit && setContentType(t.value)}
              disabled={isEdit}
              className="flex flex-col items-start p-3.5 rounded-xl border text-left transition-all"
              style={{
                borderColor:     contentType === t.value ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: contentType === t.value ? 'var(--color-accent-light)' : 'var(--color-surface)',
                opacity: isEdit ? 0.75 : 1,
                cursor:  isEdit ? 'default' : 'pointer',
              }}
            >
              <span
                className="text-sm font-semibold mb-0.5"
                style={{ color: contentType === t.value ? 'var(--color-accent-dark)' : 'var(--color-text-primary)' }}
              >
                {t.label}
              </span>
              <span className="text-xs leading-snug" style={{ color: 'var(--color-text-tertiary)' }}>
                {t.hint}
              </span>
            </button>
          ))}
        </div>
        {isEdit && (
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Content type cannot be changed after creation.
          </p>
        )}
      </section>

      <Divider />

      {/* ── Core fields ───────────────────────────────────────── */}
      <section className="space-y-5">
        <Field label="Title" required>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={
              contentType === 'post' ? 'e.g. How to Size Positions with the Kelly Criterion' :
              contentType === 'link' ? 'e.g. Options Basics — Investopedia' :
              'e.g. May 2025 Session Slides'
            }
            required
            className="form-input"
          />
        </Field>

        <Field label="Description" hint="A short summary shown in the content list (optional)">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="A one or two sentence summary…"
            className="form-input resize-none"
          />
        </Field>

        <Field label="Published date">
          <input
            type="date"
            value={publishedAt}
            onChange={e => setPublishedAt(e.target.value)}
            className="form-input"
          />
        </Field>
      </section>

      <Divider />

      {/* ── Type-specific fields ──────────────────────────────── */}
      {contentType === 'post' && (
        <section>
          <FieldLabel>Article body</FieldLabel>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
            Use the toolbar to format headings, lists, links, and more.
          </p>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Start writing…"
          />
        </section>
      )}

      {contentType === 'link' && (
        <section className="space-y-5">
          <Field label="URL" required hint="Paste the full URL — YouTube, podcast, article, etc.">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              required
              className="form-input"
            />
          </Field>
          {url && url.includes('youtube.com') || url.includes('youtu.be') ? (
            <p className="text-xs" style={{ color: 'var(--color-accent)' }}>
              ✓ YouTube link detected — will be embedded as a player on the page.
            </p>
          ) : null}
        </section>
      )}

      {contentType === 'file' && (
        <section className="space-y-5">
          <div
            className="rounded-xl border-2 border-dashed p-8 text-center"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Paste a file URL below
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Upload your file to Supabase Storage first, then paste the public URL here.
              Supported: PDF, PPTX, XLSX, DOCX, CSV.
            </p>
          </div>
          <Field label="File URL" hint="The Supabase Storage URL for the uploaded file">
            <input
              type="url"
              value={fileUrl}
              onChange={e => setFileUrl(e.target.value)}
              placeholder="https://your-project.supabase.co/storage/v1/object/..."
              className="form-input"
            />
          </Field>
          <Field label="File name" hint="Display name shown to members (e.g. 'May 2025 Slides.pdf')">
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="filename.pdf"
              className="form-input"
            />
          </Field>
        </section>
      )}

      <Divider />

      {/* ── Category tags ─────────────────────────────────────── */}
      <section>
        <FieldLabel required>Categories</FieldLabel>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
          Tag to one or more categories — this item appears in each selected category page.
        </p>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(cat => {
            const selected = selectedCatIds.includes(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all"
                style={{
                  borderColor:     selected ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: selected ? 'var(--color-accent-light)' : 'var(--color-surface)',
                  color:           selected ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                  fontWeight:      selected ? '500' : '400',
                }}
              >
                {selected && <Check size={12} />}
                {cat.icon ?? ''} {cat.name}
              </button>
            )
          })}
        </div>
      </section>

      <Divider />

      {/* ── Meeting association ───────────────────────────────── */}
      <section>
        <FieldLabel>Associate with meetings</FieldLabel>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
          This item will appear in the pre-study list on the selected meeting pages.
          Optional — leave blank if not relevant to a specific meeting.
        </p>

        {allMeetings.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No meetings yet. Create a meeting first if you want to associate content.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border p-2"
            style={{ borderColor: 'var(--color-border)' }}>
            {allMeetings.map(m => {
              const selected = selectedMeetIds.includes(m.id)
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selected ? 'var(--color-accent-light)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMeeting(m.id)}
                    className="w-4 h-4 accent-[var(--color-accent)] shrink-0"
                  />
                  <span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {m.title}
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      {formatDate(m.meeting_date)}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        )}

        {/* Selected meeting badges */}
        {selectedMeetIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedMeetIds.map(id => {
              const m = allMeetings.find(x => x.id === id)
              if (!m) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent-dark)' }}
                >
                  {m.title}
                  <button type="button" onClick={() => toggleMeeting(id)}>
                    <X size={11} />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Submit ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Publish'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
      </div>

    </form>
  )
}

// ── Helpers ───────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
      {children}
      {required && <span className="ml-0.5" style={{ color: 'var(--color-accent)' }}>*</span>}
    </p>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}{required && <span className="ml-0.5" style={{ color: 'var(--color-accent)' }}>*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hint}</p>}
    </div>
  )
}

function Divider() {
  return <hr style={{ borderColor: 'var(--color-border)' }} />
}
