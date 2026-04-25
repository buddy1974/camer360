'use client'
import { Node, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { detectPlatform, platformLabel, platformIcon } from '@/lib/embeds'

// ─── React NodeView for display in editor ──────────────────────────────────

interface EmbedViewProps {
  node: { attrs: { html: string } }
  deleteNode: () => void
}

function EmbedBlockView({ node, deleteNode }: EmbedViewProps) {
  const { html } = node.attrs
  const platform = detectPlatform(html) || detectPlatform(html.replace(/&amp;/g, '&'))
  const label    = platformLabel(platform)
  const icon     = platformIcon(platform)

  return React.createElement(
    NodeViewWrapper,
    { as: 'div' },
    React.createElement(
      'div',
      {
        contentEditable: false,
        style: {
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '12px',
          border:         '1px dashed #2A2A2A',
          borderRadius:   '10px',
          background:     '#0A0A0A',
          padding:        '14px 16px',
          margin:         '12px 0',
          userSelect:     'none',
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        React.createElement('span', { style: { fontSize: '1.4rem' } }, icon),
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { style: { fontSize: '0.78rem', fontWeight: 700, color: '#DDD' } },
            `${label} Embed`
          ),
          React.createElement(
            'div',
            { style: { fontSize: '0.65rem', color: '#555', marginTop: '2px' } },
            'Renders on publish'
          )
        )
      ),
      React.createElement(
        'button',
        {
          onClick: () => deleteNode(),
          style: {
            background:   'transparent',
            border:       '1px solid #333',
            color:        '#666',
            borderRadius: '6px',
            padding:      '4px 10px',
            fontSize:     '0.7rem',
            cursor:       'pointer',
            flexShrink:   0,
          },
        },
        'Remove'
      )
    )
  )
}

// ─── TipTap Node extension ─────────────────────────────────────────────────

export const EmbedBlock = Node.create({
  name:  'embedBlock',
  group: 'block',
  atom:  true,

  addAttributes() {
    return {
      html: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        // Match our own placeholder divs when re-loading saved content
        tag: 'div',
        getAttrs: (node: HTMLElement | string) => {
          if (typeof node === 'string') return false
          if (node.classList.contains('embed-block') && node.hasAttribute('data-embed')) {
            try {
              return { html: decodeURIComponent(node.getAttribute('data-embed') || '') }
            } catch {
              return false
            }
          }
          // Detect existing 16:9 video wrapper divs (from injectVideoEmbeds server output)
          const style = node.getAttribute('style') || ''
          if (style.includes('padding-bottom:56.25%') || style.includes('padding-bottom: 56.25%')) {
            return { html: node.outerHTML }
          }
          // Detect flex-centered embed wrappers (TikTok, Instagram, Twitter)
          if (style.includes('display:flex') && style.includes('justify-content:center') && node.querySelector('blockquote, iframe')) {
            return { html: node.outerHTML }
          }
          return false
        },
      },
    ]
  },

  renderHTML({ node }) {
    // Output a placeholder div — ArticleEditor decodes this before saving
    return [
      'div',
      {
        class:        'embed-block',
        'data-embed': encodeURIComponent(node.attrs.html as string),
      },
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedBlockView as any)
  },
})
