import theme from '../data/theme.json'

const { colors, font, spacing, panel } = theme

export default function Tooltip({ data, x, y }) {
  if (!data) return null

  return (
    <div style={{ ...s.box, left: x + 16, top: y - 10 }}>
      <div style={s.name}>
        {data.name}
        {data.type === 'dwarf_planet' && <span style={s.tag}> dwarf planet</span>}
        {data.type === 'moon' && <span style={s.tag}> moon</span>}
      </div>
      <div style={s.row}>Gravity: <b>{data.surfaceGravity} m/s²</b></div>
      <div style={s.row}>Radius: <b>{data.radiusKm.toLocaleString()} km</b></div>
      <div style={s.row}>Surface temp: <b>{data.surfaceTempC}°C</b></div>
      {data.weightMultiplier !== undefined && (
        <div style={{ ...s.row, color: colors.textGreen }}>
          70 kg person weighs <b>{(70 * data.weightMultiplier).toFixed(1)} kg</b> here
        </div>
      )}
    </div>
  )
}

const s = {
  box: {
    position: 'fixed',
    background: colors.panelBg,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: panel.borderRadius,
    padding: `${spacing.panelPaddingV - 4}px ${spacing.panelPaddingH}px`,
    color: colors.textPrimary,
    fontSize: font.sizeBase,
    fontFamily: font.family,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: 100,
  },
  name: {
    fontWeight: font.weightBold,
    fontSize: font.sizeMedium,
    color: colors.accent,
    marginBottom: spacing.rowGap * 2,
  },
  tag: {
    fontWeight: font.weightNormal,
    fontSize: font.sizeSmall,
    color: colors.textMuted,
    marginLeft: 4,
  },
  row: {
    marginBottom: spacing.rowGap,
    color: colors.textSecondary,
    fontSize: font.sizeBase,
  },
}
