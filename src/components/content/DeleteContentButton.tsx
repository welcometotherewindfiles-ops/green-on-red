'use client'
// ============================================================
// DeleteContentButton — two-step confirm → delete, inline.
// ============================================================
import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteContent } from '@/app/actions/content'

interface Props {
  id: string
  redirectTo?: string
}

export function DeleteContentButton({ id, redirectTo }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      try {
        await deleteContent(id, redirectTo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed.')
        setConfirming(false)
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Delete this item?
        </span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-60"
          style={{ backgroundColor: '#c0392b' }}
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          {isPending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
        {error && <span className="text-xs" style={{ color: '#c0392b' }}>{error}</span>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors"
      style={{ color: '#c0392b', borderColor: 'var(--color-border)' }}
    >
      <Trash2 size={13} />
      Delete
    </button>
  )
}
