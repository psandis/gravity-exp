import theme from '../data/theme.json'

const { colors, font, panel, spacing } = theme

export default function SimClock({ simDate, speedMultiplier }) {
  const speedLabel = speedMultiplier === 0
    ? 'Paused'
    : `1 sec = ${speedMultiplier} Earth day${speedMultiplier !== 1 ? 's' : ''}`

  return (
    <div style={s.clock}>
      <div style={s.date}>{simDate}</div>
      <div style={s.speed}>{speedLabel}</div>
    </div>
  )
}

const s = {
  clock: {
    position: 'fixed',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    background: colors.panelBg,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: panel.borderRadius,
    padding: `${spacing.panelPaddingV - 6}px ${spacing.panelPaddingH + 2}px`,
    textAlign: 'center',
    fontFamily: font.family,
    pointerEvents: 'none',
    zIndex: panel.zIndex,
  },
  date: {
    color: colors.accent,
    fontSize: font.sizeXLarge,
    fontWeight: font.weightBold,
    letterSpacing: 1,
  },
  speed: {
    color: colors.textSecondary,
    fontSize: font.sizeMedium,
    marginTop: spacing.rowGap + 1,
  },
}
