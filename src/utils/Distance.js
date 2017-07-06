export const haverSine = (point1, point2) => {
  /*
  Function which calculates the distance between two points
  Check  http://www.movable-type.co.uk/scripts/latlong.html
  */
  const toRadians = (deg) => {
    return (deg / 180) * Math.PI
  }
  const toDegrees = (rad) => {
    return (((rad / Math.PI) * 180) + 360) % 360
  }

  /* Haversine distance: */
  const R = 6371e3 // metres
  const φ1 = toRadians(point1.y)
  const φ2 = toRadians(point2.y)
  const λ1 = toRadians(point1.x)
  const λ2 = toRadians(point2.x)
  const Δφ = (φ2 - φ1)
  const Δλ = (λ2 - λ1)
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
  Math.cos(φ1) * Math.cos(φ2) *
  Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  // Haversine bearing
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1)
  const bearing = toDegrees(Math.atan2(y, x))
  return {distance: distance, bearing: bearing}
}
