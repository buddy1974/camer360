'use client'
import { useState, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { EmbedModal }  from './EmbedModal'
import { ModeToggle }  from './RichEditor'

interface Props {
  editor:          Editor | null
  onInsertEmbed:   (html: string) => void
  onInsertImage:   (url: string) => void
  onToggleMedia:   () => void
  showMedia:       boolean
  mode:            'visual' | 'source'
  onModeChange:    (m: 'visual' | 'source') => void
}

const BTN: React.CSSProperties = {
  background:   'transparent',
  border:       '1px solid transparent',
  color:        '#888',
  borderRadius: '5px',
  padding:      '3px 7px',
  fontSize:     '0.78rem',
  fontWeight:   700,
  cursor:       'pointer',
  lineHeight:   1,
  minWidth:     28,
}
const BTN_ACTIVE: React.CSSProperties = {
  ...BTN,
  background: '#1A1A1A',
  border:     '1px solid #333',
  color:      '#EEE',
}

function Btn({
  label, title, active, onClick,
}: { label: string; title: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={active ? BTN_ACTIVE : BTN}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#141414'; (e.currentTarget as HTMLElement).style.color = '#CCC' } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#888' } }}
    >
      {label}
    </button>
  )
}

export function Toolbar({ editor, onInsertEmbed, onInsertImage, onToggleMedia, showMedia, mode, onModeChange }: Props) {
  const [showEmbed, setShowEmbed] = useState(false)
  const [linkOpen,  setLinkOpen]  = useState(false)
  const [linkUrl,   setLinkUrl]   = useState('')

  const cmd = useCallback((fn: () => boolean) => {
    if (!editor) return
    fn()
    editor.commands.focus()
  }, [editor])

  function applyLink() {
    if (!editor) return
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run()
    }
    setLinkOpen(false)
    setLinkUrl('')
  }

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const form = new FormData()
    form.append('file', file)
    const res  = await fetch('/api/admin/upload', { method: 'POST', body: form, credentials: 'include' })
    const data = await res.json() as { url?: string }
    if (data.url) onInsertImage(data.url)
  }, [onInsertImage])

  const sep = <span style={{ width: 1, height: 18, background: '#222', display: 'inline-block', margin: '0 4px', verticalAlign: 'middle' }} />

  return (
    <>
      <div style={{
        display:        'flex',
        alignItems:     'center',
        flexWrap:       'wrap',
        gap:            '2px',
        padding:        '6px 10px',
        borderBottom:   '1px solid #1A1A1A',
        background:     '#0C0C0C',
      }}>
        <Btn label="B"  title="Bold"          active={editor?.isActive('bold')}          onClick={() => cmd(() => editor!.chain().focus().toggleBold().run())} />
        <Btn label="I"  title="Italic"        active={editor?.isActive('italic')}        onClick={() => cmd(() => editor!.chain().focus().toggleItalic().run())} />
        <Btn label="U"  title="Underline"     active={editor?.isActive('underline')}     onClick={() => cmd(() => editor!.chain().focus().toggleUnderline().run())} />
        <Btn label="S"  title="Strikethrough" active={editor?.isActive('strike')}        onClick={() => cmd(() => editor!.chain().focus().toggleStrike().run())} />
        {sep}
        <Btn label="H2" title="Heading 2"     active={editor?.isActive('heading', { level: 2 })} onClick={() => cmd(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())} />
        <Btn label="H3" title="Heading 3"     active={editor?.isActive('heading', { level: 3 })} onClick={() => cmd(() => editor!.chain().focus().toggleHeading({ level: 3 }).run())} />
        {sep}
        <Btn label="❝"  title="Blockquote"   active={editor?.isActive('blockquote')}    onClick={() => cmd(() => editor!.chain().focus().toggleBlockquote().run())} />
        <Btn label="•"  title="Bullet list"   active={editor?.isActive('bulletList')}    onClick={() => cmd(() => editor!.chain().focus().toggleBulletList().run())} />
        <Btn label="1." title="Ordered list"  active={editor?.isActive('orderedList')}   onClick={() => cmd(() => editor!.chain().focus().toggleOrderedList().run())} />
        <Btn label="—"  title="Horizontal rule"                                           onClick={() => cmd(() => editor!.chain().focus().setHorizontalRule().run())} />
        {sep}

        {/* Link */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Btn
            label="🔗"
            title="Insert / edit link"
            active={editor?.isActive('link')}
            onClick={() => {
              const current = editor?.getAttributes('link').href || ''
              setLinkUrl(current)
              setLinkOpen(v => !v)
            }}
          />
          {linkOpen && (
            <div style={{
              position:    'absolute',
              top:         '110%',
              left:        0,
              zIndex:      50,
              background:  '#111',
              border:      '1px solid #2A2A2A',
              borderRadius: '8px',
              padding:     '10px',
              display:     'flex',
              gap:         '6px',
              minWidth:    260,
            }}>
              <input
                autoFocus
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setLinkOpen(false) }}
                placeholder="https://..."
                style={{ flex: 1, background: '#080808', border: '1px solid #2A2A2A', borderRadius: '5px', color: '#EEE', fontSize: '0.82rem', padding: '5px 8px', outline: 'none' }}
              />
              <button onClick={applyLink}     style={{ ...BTN, background: '#C8102E', color: '#fff', border: 'none', padding: '5px 10px' }}>Set</button>
              <button onClick={() => setLinkOpen(false)} style={{ ...BTN, padding: '5px 8px' }}>✕</button>
            </div>
          )}
        </div>

        {/* Image upload */}
        <label title="Upload image" style={{ ...BTN, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
          📷
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        </label>

        {/* Media panel toggle */}
        <button
          title="Toggle media panel"
          onClick={onToggleMedia}
          style={{ ...BTN, ...(showMedia ? BTN_ACTIVE : {}) }}
        >
          🖼
        </button>

        {/* Video embed */}
        <Btn label="📺" title="Insert video / embed" onClick={() => setShowEmbed(true)} />

        <div style={{ flex: 1 }} />
        <ModeToggle mode={mode} onModeChange={onModeChange} />
      </div>

      {showEmbed && (
        <EmbedModal
          onInsert={html => { onInsertEmbed(html); setShowEmbed(false) }}
          onClose={() => setShowEmbed(false)}
        />
      )}
    </>
  )
}
