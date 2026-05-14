// ============================================================
// MeetingFormatBadge — small pill showing meeting format
// ============================================================
import { MapPin, Video, Users } from 'lucide-react'
import { type Meeting } from '@/types'

interface Props {
  format: Meeting['format']
}

const FORMAT_CONFIG = {
  'in-person': { label: 'In Person', Icon: MapPin },
  'online':    { label: 'Online',    Icon: Video },
  'hybrid':    { label: 'Hybrid',    Icon: Users },
}

export function MeetingFormatBadge({ format }: Props) {
  const { label, Icon } = FORMAT_CONFIG[format] ?? FORMAT_CONFIG['online']

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: 'var(--color-accent-light)',
        color: 'var(--color-accent-dark)',
      }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {label}
    </span>
  )
}
