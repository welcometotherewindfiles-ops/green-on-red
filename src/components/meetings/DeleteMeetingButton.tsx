'use client'
// ============================================================
// DeleteMeetingButton — inline confirm-then-delete for admin.
// Two-step: first click shows confirmation, second deletes.
// ============================================================
import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteMeeting } from '@/app/actions/meetings'

export function DeleteMeetingButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      try {
        await deleteMeeting(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed.')
        setConfirming(false)
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Delete this meeting?
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
        {error && (
          <span className="text-xs" style={{ color: '#c0392b' }}>{error}</span>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors"
      style={{
        color: '#c0392b',
        borderColor: 'var(--color-border)',
      }}
    >
      <Trash2 size={13} />
      Delete
    </button>
  )
}
