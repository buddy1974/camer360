'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit }              from '@tiptap/starter-kit'
import Image                       from '@tiptap/extension-image'
import Link                        from '@tiptap/extension-link'
import Underline                   from '@tiptap/extension-underline'
import { EmbedBlock }              from './EmbedBlock'
import { Toolbar }                 from './Toolbar'
import { MediaPicker }             from '@/components/admin/MediaPicker'

// Decode placeholder divs back to real embed HTML before saving
export function decodeEmbedBlocks(html: string): string {
  return html.replace(
    /<div\s+class="embed-block"\s+data-embed="([^"]*)"[^>]*>\s*<\/div>/g,
    (_, encoded) => {
      try { return decodeURIComponent(encoded) } catch { return '' }
    }
  )
}

interface Props {
  value:    string
  onChange: (html: string) => void
  mode:     'visual' | 'source'
  onModeChange: (m: 'visual' | 'source') => void
}

export function RichEditor({ value, onChange, mode, onModeChange }: Props) {
  const prevValueRef  = useRef(value)
  const [showMedia, setShowMedia] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      EmbedBlock,
    ],
    content:          value,
    editorProps: {
      attributes: {
        style: [
          'min-height:400px',
          'padding:16px',
          'outline:none',
          'font-size:0.92rem',
          'line-height:1.8',
          'color:#E8E8E8',
        ].join(';'),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      prevValueRef.current = html
      onChange(html)
    },
  })

  // Sync external value changes (e.g. AI enhance) into editor
  useEffect(() => {
    if (!editor || mode !== 'visual') return
    if (value !== prevValueRef.current) {
      prevValueRef.current = value
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor, mode])

  const insertEmbed = useCallback((html: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(
      { type: 'embedBlock', attrs: { html } },
    ).run()
  }, [editor])

  const insertImage = useCallback((url: string) => {
    if (!editor) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const mediaPanel = (
    <div style={{ borderTop: '1px solid #1A1A1A', background: '#0A0A0A', padding: '14px' }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
        Media — drag &amp; drop or click to upload · hover thumbnail → Insert
      </div>
      <MediaPicker onInsert={insertImage} />
    </div>
  )

  if (mode === 'source') {
    return (
      <div style={{ border: '1px solid #2A2A2A', borderRadius: '10px', background: '#080808', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '6px 10px', borderBottom: '1px solid #1A1A1A', background: '#0C0C0C' }}>
          <button onClick={() => setShowMedia(v => !v)} style={mediaBtnStyle(showMedia)}>📷 Media</button>
          <ModeToggle mode={mode} onModeChange={onModeChange} />
        </div>
        {showMedia && mediaPanel}
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          style={{
            width:        '100%',
            minHeight:    '480px',
            background:   '#080808',
            border:       'none',
            color:        '#EEE',
            fontFamily:   'monospace',
            fontSize:     '0.82rem',
            lineHeight:   1.7,
            padding:      '14px',
            resize:       'vertical',
            outline:      'none',
            boxSizing:    'border-box',
            display:      'block',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid #2A2A2A', borderRadius: '10px', background: '#080808', overflow: 'hidden' }}>
      <Toolbar
        editor={editor}
        onInsertEmbed={insertEmbed}
        onInsertImage={insertImage}
        onToggleMedia={() => setShowMedia(v => !v)}
        showMedia={showMedia}
        mode={mode}
        onModeChange={onModeChange}
      />
      {showMedia && mediaPanel}
      <EditorContent editor={editor} />
    </div>
  )
}

function mediaBtnStyle(active: boolean): React.CSSProperties {
  return {
    background:   active ? '#1A1A1A' : 'transparent',
    border:       '1px solid #2A2A2A',
    color:        active ? '#EEE' : '#666',
    borderRadius: '6px',
    padding:      '4px 10px',
    fontSize:     '0.7rem',
    fontWeight:   700,
    cursor:       'pointer',
  }
}

// ─── Small mode toggle button (shared) ────────────────────────────────────
export function ModeToggle({ mode, onModeChange }: { mode: 'visual'|'source'; onModeChange: (m: 'visual'|'source') => void }) {
  return (
    <button
      onClick={() => onModeChange(mode === 'visual' ? 'source' : 'visual')}
      title={mode === 'visual' ? 'Switch to HTML source' : 'Switch to visual editor'}
      style={{
        background:   '#111',
        border:       '1px solid #2A2A2A',
        color:        '#666',
        borderRadius: '6px',
        padding:      '4px 10px',
        fontSize:     '0.7rem',
        fontWeight:   700,
        cursor:       'pointer',
        fontFamily:   'monospace',
      }}
    >
      {mode === 'visual' ? '</>' : '✏'}
    </button>
  )
}
