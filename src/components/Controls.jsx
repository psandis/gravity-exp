import theme from '../data/theme.json'

const { colors, font, panel, spacing } = theme

export default function Controls({ speedMultiplier, onSpeedChange, viewMode, onExitPOI, selected, maxSpeed = 20 }) {
  return (
    <div style={s.bar}>
      {viewMode === 'poi' && selected && (
        <button style={s.exitBtn} onClick={onExitPOI}>
          Exit {selected.name}
        </button>
      )}

      <div style={s.sliderBox}>
        <div style={s.sliderRow}>
          <span style={s.label}>SPEED</span>
          <span style={s.value}>
            {speedMultiplier === 0 ? 'Paused' : `${speedMultiplier.toFixed(1)}x`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxSpeed}
          step={0.5}
          value={speedMultiplier}
          onChange={e => onSpeedChange(parseFloat(e.target.value))}
          style={s.slider}
        />
        <div style={s.ticks}>
          <span>Pause</span>
          <span>5x</span>
          <span>10x</span>
          <span>{maxSpeed}x</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  bar: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.panelPaddingV - 4,
    zIndex: panel.zIndex,
  },
  sliderBox: {
    background: colors.panelBg,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: panel.borderRadius,
    padding: `${spacing.panelPaddingV - 2}px ${spacing.panelPaddingH + 4}px`,
    minWidth: 280,
  },
  sliderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: spacing.sectionGapTop,
  },
  label: {
    color: colors.textDim,
    fontSize: font.sizeSmall,
    letterSpacing: 2,
    fontFamily: font.family,
  },
  value: {
    color: colors.accent,
    fontSize: font.sizeMedium,
    fontWeight: font.weightBold,
    fontFamily: font.family,
  },
  slider: {
    width: '100%',
    display: 'block',
  },
  ticks: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: spacing.rowGap * 2,
    color: colors.textDim,
    fontSize: font.sizeSmall,
    fontFamily: font.family,
  },
  exitBtn: {
    background: colors.panelBg,
    border: `1px solid ${colors.accentBorder}`,
    color: colors.accent,
    padding: `${spacing.rowGap * 2 + 2}px ${spacing.panelPaddingH + 4}px`,
    borderRadius: panel.borderRadius - 2,
    cursor: 'pointer',
    fontFamily: font.family,
    fontSize: font.sizeBase,
    letterSpacing: 1,
  },
}
