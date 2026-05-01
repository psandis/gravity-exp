import { useState, useEffect, useRef } from 'react'
import theme from '../data/theme.json'

const { colors, font, panel, spacing } = theme

export default function InfoPanel({ selected }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [panelPos, setPanelPos] = useState({ left: 16, bottom: 90 })
  const [dragging, setDragging] = useState(false)
  const panelRef = useRef()
  const dragState = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      if (!dragState.current) return
      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY
      setPanelPos({ left: dragState.current.origLeft + dx, top: dragState.current.origTop + dy })
    }
    const onUp = () => { dragState.current = null; setDragging(false) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  const onDragStart = (e) => {
    const rect = panelRef.current.getBoundingClientRect()
    dragState.current = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top }
    setPanelPos({ left: rect.left, top: rect.top })
    setDragging(true)
    e.preventDefault()
  }

  useEffect(() => {
    if (!selected) return
    setContent(null)
    setError(null)
    setLoading(true)
    setCollapsed(false)

    const key = selected.wikipediaKey || selected.name
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${key}`)
      .then(r => r.json())
      .then(data => {
        setContent(data.extract || 'No information available.')
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load Wikipedia data.')
        setLoading(false)
      })
  }, [selected])

  if (!selected) return null

  const posStyle = panelPos.top !== undefined
    ? { left: panelPos.left, top: panelPos.top }
    : { left: panelPos.left, bottom: panelPos.bottom }

  return (
    <div ref={panelRef} style={{ ...s.panel, ...posStyle }}>
      <div
        style={{ ...s.handle, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onDragStart}
      >
        <div style={s.handleLeft}>
          <span style={s.bodyName}>{selected.name}</span>
          <span style={s.wikiTag}>WIKIPEDIA</span>
        </div>
        <div style={s.handleRight}>
          <button
            style={s.collapseBtn}
            onClick={(e) => { e.stopPropagation(); setCollapsed(c => !c) }}
          >
            {collapsed ? '▾' : '▴'}
          </button>
          <span style={s.dragDots}>⠿</span>
        </div>
      </div>

      {!collapsed && (
        <div style={s.body}>
          {loading && <div style={s.loading}>Loading...</div>}
          {error && <div style={s.err}>{error}</div>}
          {content && (
            <>
              <div style={s.description}>{selected.description}</div>
              <div style={s.divider} />
              <div style={s.extract}>{content}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  panel: {
    position: 'fixed',
    zIndex: panel.zIndex,
    background: colors.panelBg,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: panel.borderRadius,
    color: colors.textPrimary,
    fontFamily: font.family,
    fontSize: font.sizeBase,
    width: 340,
    maxHeight: 340,
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  },
  handle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.panelPaddingV - 2}px ${spacing.panelPaddingH}px`,
    borderBottom: `1px solid ${colors.handleBorder}`,
    flexShrink: 0,
  },
  handleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  handleRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  bodyName: {
    fontSize: font.sizeLarge,
    fontWeight: font.weightBold,
    color: colors.accent,
    letterSpacing: 1,
  },
  wikiTag: {
    fontSize: font.sizeSmall,
    color: colors.textDim,
    letterSpacing: 2,
  },
  collapseBtn: {
    background: 'transparent',
    border: 'none',
    color: colors.textMuted,
    cursor: 'pointer',
    fontFamily: font.family,
    fontSize: font.sizeMedium,
    padding: 0,
    lineHeight: 1,
  },
  dragDots: {
    color: colors.dragIcon,
    fontSize: font.sizeLarge + 2,
    lineHeight: 1,
  },
  body: {
    padding: `${spacing.panelPaddingV}px ${spacing.panelPaddingH}px`,
    overflowY: 'auto',
    flex: 1,
  },
  description: {
    color: colors.textSecondary,
    fontSize: font.sizeMedium,
    lineHeight: 1.5,
    marginBottom: spacing.sectionGapTop,
  },
  divider: {
    borderBottom: `1px solid ${colors.sectionBorder}`,
    marginBottom: spacing.sectionGapTop,
  },
  extract: {
    color: colors.textSecondary,
    fontSize: font.sizeMedium,
    lineHeight: 1.7,
  },
  loading: {
    color: colors.textDim,
    fontStyle: 'italic',
  },
  err: {
    color: '#ff6b6b',
    fontSize: font.sizeBase,
  },
}
