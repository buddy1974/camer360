'use client'
import { useMemo } from 'react'
import type { ArticleWithRelations } from '@/lib/types'

export default function FamilyTreeRenderer({ article }: { article: ArticleWithRelations }) {
  // Extract content before and after first UL
  const { treeHtml, introHtml, outroHtml } = useMemo(() => {
    if (typeof window === 'undefined') return { treeHtml: '', introHtml: article.body, outroHtml: '' }

    const doc = new DOMParser().parseFromString(article.body, 'text/html')
    const firstUl = doc.querySelector('ul')

    if (!firstUl) return { treeHtml: '', introHtml: article.body, outroHtml: '' }

    // Everything before the UL
    let introContent = ''
    let outroContent = ''
    let reached = false

    Array.from(doc.body.childNodes).forEach(node => {
      if (node === firstUl) { reached = true; return }
      if (!reached) introContent += (node as Element).outerHTML ?? node.textContent ?? ''
      else outroContent += (node as Element).outerHTML ?? node.textContent ?? ''
    })

    return { treeHtml: firstUl.outerHTML, introHtml: introContent, outroHtml: outroContent }
  }, [article.body])

  return (
    <div>
      {/* Intro content */}
      {introHtml && (
        <div
          dangerouslySetInnerHTML={{ __html: introHtml }}
          style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1rem', marginBottom: '40px' }}
        />
      )}

      {/* Tree */}
      {treeHtml && (
        <div style={{ overflowX: 'auto', marginBottom: '40px' }}>
          <style>{`
            .family-tree ul {
              padding-top: 20px;
              position: relative;
              display: flex;
              justify-content: center;
              gap: 0;
            }
            .family-tree li {
              list-style: none;
              position: relative;
              padding: 20px 8px 0 8px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .family-tree li::before,
            .family-tree li::after {
              content: '';
              position: absolute;
              top: 0;
              border-top: 2px solid #D4AF37;
              width: 50%;
            }
            .family-tree li::before { right: 50%; border-right: 2px solid #D4AF37; }
            .family-tree li::after  { left: 50%;  border-left:  2px solid #D4AF37; }
            .family-tree li:only-child::before,
            .family-tree li:only-child::after { display: none; }
            .family-tree li:first-child::before,
            .family-tree li:last-child::after  { border: none; }
            .family-tree li:first-child::after { border-radius: 8px 0 0 0; }
            .family-tree li:last-child::before { border-radius: 0 8px 0 0; }
            .family-tree li > span {
              display: inline-block;
              background: #111;
              border: 1px solid #D4AF37;
              border-radius: 8px;
              padding: 8px 14px;
              font-size: 0.78rem;
              font-weight: 700;
              color: #EEE;
              white-space: nowrap;
              cursor: default;
              transition: background 0.2s, color 0.2s;
              position: relative;
            }
            .family-tree li > span:hover {
              background: #D4AF37;
              color: #1A1A1A;
            }
            .family-tree > ul { padding-top: 0; }
            .family-tree > ul > li::before,
            .family-tree > ul > li::after { display: none; }
          `}</style>
          <div
            className="family-tree"
            dangerouslySetInnerHTML={{
              __html: treeHtml.replace(/<li>/g, '<li><span>').replace(/<\/li>/g, '</span></li>'),
            }}
          />
        </div>
      )}

      {/* Outro content */}
      {outroHtml && (
        <div
          dangerouslySetInnerHTML={{ __html: outroHtml }}
          style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1rem' }}
        />
      )}

      {/* Fallback if no UL found */}
      {!treeHtml && !introHtml && (
        <div
          dangerouslySetInnerHTML={{ __html: article.body }}
          style={{ color: '#BBBBBB', lineHeight: 1.85, fontSize: '1rem' }}
        />
      )}
    </div>
  )
}
