const DEG2RAD = Math.PI / 180
const J2000 = new Date('2000-01-01T12:00:00Z').getTime()
const MS_PER_DAY = 86400000

// Days elapsed since J2000.0 epoch for a given JS Date
export function daysSinceJ2000(date = new Date()) {
  return (date.getTime() - J2000) / MS_PER_DAY
}

// Initial orbital angle (radians) for a body at a given date
export function initialAngleForDate(planet, date = new Date()) {
  const d = daysSinceJ2000(date)
  const meanLongDeg = planet.meanLongitudeJ2000 + planet.dailyMotionDeg * d
  return (meanLongDeg % 360) * DEG2RAD
}

// Radians advanced per real second at 1x speed (1 real second = 1 sim day)
export function radiansPerSimDay(planet) {
  return planet.dailyMotionDeg * DEG2RAD
}

// Returns x,z position on orbit given angle and radius
export function orbitalPosition(angle, radius) {
  return {
    x: Math.cos(angle) * radius,
    y: 0,
    z: Math.sin(angle) * radius,
  }
}

export function formatMass(kg) {
  if (kg >= 1e30) return `${(kg / 1e30).toFixed(3)} × 10³⁰ kg`
  if (kg >= 1e27) return `${(kg / 1e27).toFixed(3)} × 10²⁷ kg`
  if (kg >= 1e24) return `${(kg / 1e24).toFixed(3)} × 10²⁴ kg`
  if (kg >= 1e22) return `${(kg / 1e22).toFixed(3)} × 10²² kg`
  return `${kg.toExponential(2)} kg`
}

export function formatDistance(au) {
  if (au === 0) return '0 AU'
  return `${au.toFixed(3)} AU (${(au * 149.6).toFixed(1)}M km)`
}

// Add simulated days to a date
export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY)
}

export function formatSimDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
