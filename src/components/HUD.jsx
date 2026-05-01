import { useRef, useState, useEffect } from 'react'
import { formatMass, formatDistance } from '../utils/orbital'
import theme from '../data/theme.json'
import planetsData from '../data/planets.json'

const { colors, font, panel, spacing } = theme

const JUMP_ORDER = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'iss']

export default function HUD({
  selected, positions, speedMultiplier, viewMode,
  showOrbits, onToggleOrbits,
  showSimClock, onToggleSimClock,
  orbitOpacity, onOrbitOpacityChange,
  ambientBrightness, onAmbientBrightnessChange,
  onJump,
}) {
  const pos = positions[selected?.name] || { x: 0, y: 0, z: 0 }
  const panelRef = useRef()
  const dragState = useRef(null)
  const [panelPos, setPanelPos] = useState({ right: 16, top: 16 })
  const [dragging, setDragging] = useState(false)
  const [displayOpen, setDisplayOpen] = useState(false)

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

  const posStyle = panelPos.left !== undefined
    ? { left: panelPos.left, top: panelPos.top }
    : { right: panelPos.right, top: panelPos.top }

  return (
    <div ref={panelRef} style={{ ...s.panel, ...posStyle }}>
      <div style={{ ...s.handle, cursor: dragging ? 'grabbing' : 'grab' }} onMouseDown={onDragStart}>
        <div>
          <div style={s.title}>GRAVITYEXP</div>
          <div style={s.subtitle}>Solar System Explorer</div>
        </div>
        <div style={s.dragDots}>⠿</div>
      </div>

      <div style={s.body}>
        <div style={s.speed}>Speed: {speedMultiplier === 0 ? 'Paused' : `${speedMultiplier.toFixed(1)}x`}</div>

        <button
          style={s.displayToggle}
          onClick={() => setDisplayOpen(v => !v)}
        >
          <span>DISPLAY</span>
          <span>{displayOpen ? '▴' : '▾'}</span>
        </button>

        {displayOpen && (
          <div style={s.displayPanel}>
            <div style={s.displaySection}>VISIBILITY</div>
            <ToggleRow label="Orbit Rings" value={showOrbits} onToggle={onToggleOrbits} />
            <ToggleRow label="Sim Clock" value={showSimClock} onToggle={onToggleSimClock} />
            <div style={s.displaySection}>ADJUSTMENTS</div>
            <SliderRow label="Orbit Opacity" value={orbitOpacity} min={0} max={0.8} step={0.01} onChange={onOrbitOpacityChange} />
            <SliderRow label="Brightness" value={ambientBrightness} min={0} max={2} step={0.05} onChange={onAmbientBrightnessChange} />
            <div style={s.displaySection}>QUICK JUMP</div>
            <select
              style={s.jumpSelect}
              value={selected ? JUMP_ORDER.find(k => planetsData[k].name === selected.name) || '' : ''}
              onChange={e => { if (e.target.value) onJump(planetsData[e.target.value]) }}
            >
              <option value="">Select body...</option>
              {JUMP_ORDER.map(key => (
                <option key={key} value={key}>
                  {planetsData[key].shortName || planetsData[key].name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!selected && (
          <div style={s.hints}>
            <div style={s.hint}>Click any body to select it</div>
            <div style={s.hint}>Scroll to zoom · Drag to orbit</div>
          </div>
        )}

        {selected && (
          <>
            <div style={s.name}>
              {selected.name}
              {selected.type === 'dwarf_planet' && <span style={s.tag}>DWARF PLANET</span>}
              {selected.type === 'moon' && <span style={s.tag}>MOON</span>}
            </div>

            <div style={s.section}>POSITION</div>
            <Row label="X" value={pos.x.toFixed(2)} />
            <Row label="Y" value={pos.y.toFixed(2)} />
            <Row label="Z" value={pos.z.toFixed(2)} />

            <div style={s.section}>PHYSICAL DATA</div>
            <Row label="Gravity" value={`${selected.surfaceGravity} m/s²`} />
            <Row label="Radius" value={`${selected.radiusKm.toLocaleString()} km`} />
            <Row label="Mass" value={formatMass(selected.massKg)} />
            <Row label="Surface Temp" value={`${selected.surfaceTempC}°C`} />

            <div style={s.section}>ORBITAL DATA</div>
            <Row label="Distance" value={formatDistance(selected.distanceFromSunAU)} />
            <Row label="Orbital Period" value={selected.orbitalPeriodDays > 0 ? `${selected.orbitalPeriodDays.toLocaleString()} days` : 'N/A'} />
            <Row label="Day Length" value={`${selected.rotationPeriodDays} Earth days`} />

            {selected.weightMultiplier !== undefined && (
              <>
                <div style={s.section}>YOU ON {selected.name.toUpperCase()}</div>
                <Row label="70 kg person" value={`${(70 * selected.weightMultiplier).toFixed(1)} kg`} valueColor={colors.textGreen} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, valueColor }) {
  return (
    <div style={s.row}>
      <span style={s.label}>{label}</span>
      <span style={{ color: valueColor || colors.textPrimary }}>{value}</span>
    </div>
  )
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <div style={s.toggleRow}>
      <span style={s.toggleLabel}>{label}</span>
      <button style={{ ...s.toggleBtn, ...(value ? s.toggleOn : s.toggleOff) }} onClick={onToggle}>
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <div style={s.sliderRow}>
      <div style={s.sliderHeader}>
        <span style={s.toggleLabel}>{label}</span>
        <span style={s.sliderValue}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={s.slider}
      />
    </div>
  )
}

const s = {
  panel: {
    position: 'fixed',
    background: colors.panelBg,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: panel.borderRadius,
    color: colors.textPrimary,
    fontFamily: font.family,
    fontSize: font.sizeBase,
    minWidth: panel.minWidth,
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    userSelect: 'none',
    zIndex: panel.zIndex,
  },
  handle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.panelPaddingV - 2}px ${spacing.panelPaddingH}px`,
    borderBottom: `1px solid ${colors.handleBorder}`,
  },
  dragDots: {
    color: colors.dragIcon,
    fontSize: font.sizeLarge + 2,
    lineHeight: 1,
  },
  title: {
    fontSize: font.sizeLarge,
    fontWeight: font.weightBold,
    letterSpacing: 3,
    color: colors.accent,
  },
  subtitle: {
    fontSize: font.sizeBase,
    color: colors.textMuted,
    marginTop: 2,
  },
  body: {
    padding: `${spacing.rowGap * 3}px ${spacing.panelPaddingH}px ${spacing.panelPaddingV}px`,
  },
  speed: {
    fontSize: font.sizeMedium,
    color: colors.accent,
    marginBottom: spacing.sectionGapTop,
  },
  displayToggle: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${colors.sectionBorder}`,
    borderRadius: panel.borderRadius - 4,
    color: colors.textMuted,
    fontFamily: font.family,
    fontSize: font.sizeSmall,
    letterSpacing: 2,
    padding: `${spacing.rowGap + 1}px ${spacing.panelPaddingH - 6}px`,
    cursor: 'pointer',
    marginBottom: spacing.sectionGapTop,
  },
  displayPanel: {
    borderTop: `1px solid ${colors.sectionBorder}`,
    paddingTop: spacing.rowGap * 2,
    marginBottom: spacing.sectionGapTop,
  },
  displaySection: {
    fontSize: font.sizeSmall,
    color: colors.textDim,
    letterSpacing: 2,
    marginTop: spacing.sectionGapTop,
    marginBottom: spacing.rowGap + 1,
    borderBottom: `1px solid ${colors.sectionBorder}`,
    paddingBottom: spacing.rowGap,
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.rowGap * 2,
  },
  toggleLabel: {
    color: colors.textMuted,
    fontSize: font.sizeBase,
  },
  toggleBtn: {
    border: 'none',
    borderRadius: panel.borderRadius - 4,
    cursor: 'pointer',
    fontFamily: font.family,
    fontSize: font.sizeSmall,
    fontWeight: font.weightBold,
    letterSpacing: 1,
    padding: `${spacing.rowGap}px ${spacing.panelPaddingH - 4}px`,
    minWidth: 44,
  },
  toggleOn: {
    background: colors.accent,
    color: '#000',
  },
  toggleOff: {
    background: 'rgba(255,255,255,0.08)',
    color: colors.textDim,
  },
  sliderRow: {
    marginBottom: spacing.sectionGapTop,
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: spacing.rowGap,
  },
  sliderValue: {
    color: colors.accent,
    fontSize: font.sizeBase,
    fontWeight: font.weightBold,
  },
  slider: {
    width: '100%',
    display: 'block',
  },
  hints: {
    borderTop: `1px solid ${colors.handleBorder}`,
    paddingTop: spacing.rowGap * 2,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: font.sizeBase,
    marginBottom: spacing.rowGap,
  },
  name: {
    fontSize: font.sizeLarge - 1,
    fontWeight: font.weightBold,
    color: colors.accent,
    marginBottom: spacing.rowGap * 2,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: `1px solid ${colors.handleBorder}`,
    paddingTop: spacing.rowGap * 2,
  },
  tag: {
    fontSize: font.sizeSmall,
    background: colors.tagBg,
    padding: '2px 5px',
    borderRadius: 3,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  section: {
    fontSize: font.sizeSmall,
    color: colors.textDim,
    letterSpacing: 2,
    marginTop: spacing.sectionGapTop,
    marginBottom: spacing.rowGap + 1,
    borderBottom: `1px solid ${colors.sectionBorder}`,
    paddingBottom: spacing.rowGap,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: spacing.rowGap,
  },
  label: {
    color: colors.textMuted,
  },
  jumpSelect: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${colors.sectionBorder}`,
    borderRadius: panel.borderRadius - 4,
    color: colors.textMuted,
    fontFamily: font.family,
    fontSize: font.sizeSmall,
    letterSpacing: 1,
    padding: `${spacing.rowGap + 3}px ${spacing.panelPaddingH - 6}px`,
    cursor: 'pointer',
    marginBottom: spacing.sectionGapTop,
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${spacing.panelPaddingH - 6}px center`,
    paddingRight: spacing.panelPaddingH + 10,
  },
}
