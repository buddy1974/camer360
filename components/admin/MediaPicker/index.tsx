'use client'
import { useState, useRef, useCallback } from 'react'

interface UploadedImage {
  url:     string
  name:    string
  loading: boolean
  error?:  string
}

interface Props {
  onInsert: (url: string) => void
}

export function MediaPicker({ onInsert }: Props) {
  const [images,   setImages]   = useState<UploadedImage[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return

    // Add placeholders immediately
    const placeholders: UploadedImage[] = arr.map(f => ({ url: '', name: f.name, loading: true }))
    setImages(prev => [...placeholders, ...prev])

    await Promise.all(arr.map(async (file, i) => {
      const form = new FormData()
      form.append('file', file)
      try {
        const res  = await fetch('/api/admin/upload', { method: 'POST', body: form, credentials: 'include' })
        const data = await res.json() as { url?: string; error?: string }
        setImages(prev => {
          const next = [...prev]
          const idx  = next.findIndex(x => x.name === file.name && x.loading)
          if (idx !== -1) {
            next[idx] = { url: data.url || '', name: file.name, loading: false, error: data.error }
          }
          return next
        })
      } catch {
        setImages(prev => {
          const next = [...prev]
          const idx  = next.findIndex(x => x.name === file.name && x.loading)
          if (idx !== -1) next[idx] = { url: '', name: file.name, loading: false, error: 'Upload failed' }
          return next
        })
      }
    }))
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }, [uploadFiles])

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        style={{
          border:       `2px dashed ${dragging ? '#C8102E' : '#2A2A2A'}`,
          borderRadius: '10px',
          background:   dragging ? '#150505' : '#0A0A0A',
          padding:      '20px',
          textAlign:    'center',
          cursor:       'pointer',
          transition:   'all 0.15s',
          marginBottom: images.length ? '12px' : 0,
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📷</div>
        <div style={{ fontSize: '0.78rem', color: '#666' }}>
          {dragging ? 'Drop images here' : 'Click or drag images to upload'}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#444', marginTop: 4 }}>
          JPEG · PNG · WebP · GIF — converted to WebP automatically
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files) { uploadFiles(e.target.files); e.target.value = '' } }}
        />
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 '8px',
        }}>
          {images.map((img, idx) => (
            <div
              key={idx}
              style={{
                position:     'relative',
                borderRadius: '8px',
                overflow:     'hidden',
                aspectRatio:  '1',
                background:   '#111',
                border:       '1px solid #1A1A1A',
              }}
            >
              {img.loading ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: '#555', animation: 'pulse 1s infinite' }}>Uploading…</span>
                </div>
              ) : img.error ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
                  <span style={{ fontSize: '0.62rem', color: '#C8102E', textAlign: 'center' }}>✗ {img.error}</span>
                </div>
              ) : (
                <>
                  <img
                    src={img.url}
                    alt={img.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                  {/* Hover overlay */}
                  <div
                    className="media-insert-overlay"
                    onClick={() => onInsert(img.url)}
                    style={{
                      position:        'absolute',
                      inset:           0,
                      background:      'rgba(0,0,0,0.65)',
                      display:         'flex',
                      alignItems:      'center',
                      justifyContent:  'center',
                      opacity:         0,
                      transition:      'opacity 0.15s',
                      cursor:          'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: '#C8102E', padding: '5px 10px', borderRadius: 6 }}>
                      + Insert
                    </span>
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    style={{
                      position:     'absolute',
                      top:          4,
                      right:        4,
                      background:   'rgba(0,0,0,0.7)',
                      border:       'none',
                      color:        '#aaa',
                      borderRadius: '50%',
                      width:        20,
                      height:       20,
                      fontSize:     '0.6rem',
                      cursor:       'pointer',
                      lineHeight:   1,
                    }}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
