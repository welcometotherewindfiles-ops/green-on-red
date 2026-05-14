'use client'
// ============================================================
// RichTextEditor — TipTap editor for Post body content.
// Toolbar: bold, italic, headings, lists, blockquote, link, HR.
// ============================================================
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Link as TipTapLink } from '@tiptap/extension-link'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link as LinkIcon, Unlink,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-[280px] px-4 py-3',
        style: 'font-family: Georgia, serif;',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  function addLink() {
    const url = window.prompt('Enter URL:')
    if (!url) return
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b"
        style={{
          backgroundColor: 'var(--color-muted)',
          borderColor: 'var(--color-border)',
        }}
      >
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        ><Bold size={14} /></ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        ><Italic size={14} /></ToolbarBtn>

        <Sep />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        ><Heading2 size={14} /></ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        ><Heading3 size={14} /></ToolbarBtn>

        <Sep />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        ><List size={14} /></ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        ><ListOrdered size={14} /></ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        ><Quote size={14} /></ToolbarBtn>

        <Sep />

        <ToolbarBtn
          onClick={addLink}
          active={editor.isActive('link')}
          title="Add link"
        ><LinkIcon size={14} /></ToolbarBtn>

        {editor.isActive('link') && (
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            active={false}
            title="Remove link"
          ><Unlink size={14} /></ToolbarBtn>
        )}

        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Horizontal rule"
        ><Minus size={14} /></ToolbarBtn>
      </div>

      {/* Editor area */}
      <div
        style={{ backgroundColor: 'var(--color-surface)', minHeight: '280px' }}
        onClick={() => editor.commands.focus()}
      >
        {!editor.getText() && placeholder && (
          <p
            className="absolute px-4 pt-3 text-sm pointer-events-none select-none"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-accent-light)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return (
    <span
      className="inline-block w-px h-4 mx-1"
      style={{ backgroundColor: 'var(--color-border)' }}
    />
  )
}
