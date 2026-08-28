function distance(a, b) {
  return a.position.distanceTo(b.position)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function attackDelay(weapon, mode = 'training') {
  // تأخيرات محسّنة وأسرع
  const base = { 
    sword: 600, 
    axe: 900, 
    bow: 800, 
    crystal: 500, 
    hybrid: 550, 
    sumo: 400, 
    nethpot: 600 
  }[weapon] || 600
  
  const modifier = mode === 'defensive' ? 1.2 : 
                   mode === 'aggressive' ? 0.85 : 
                   mode === 'hardcore' ? 0.75 : 1
  
  return Math.round(base * modifier)
}

function hasLineOfSight(bot, entity) {
  if (!bot.entity || !entity) return false
  const origin = bot.entity.position.offset(0, bot.entity.height * 0.9, 0)
  const target = entity.position.offset(0, entity.height * 0.5, 0)
  const direction = target.minus(origin)
  
  try {
    const block = bot.world.raycast(origin, direction.normalize(), Math.ceil(direction.norm()))
    return !block || block.position.distanceTo(origin) >= direction.norm() - 0.35
  } catch (error) {
    return true
  }
}

function isUnsafeBlock(block) {
  return !block || 
         block.name === 'lava' || 
         block.name === 'fire' || 
         block.name === 'cactus' ||
         block.name === 'void_air' ||
         block.name === 'wither_rose'
}

function chooseTarget(bot) {
  return Object.values(bot.entities)
    .filter(entity => entity.type === 'player' && entity.username !== bot.username && !entity.isDead)
    .sort((a, b) => distance(a, bot.entity) - distance(b, bot.entity))[0] || null
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getTargetVelocity(entity) {
  if (!entity || !entity.velocity) return { x: 0, y: 0, z: 0 }
  return {
    x: entity.velocity.x || 0,
    y: entity.velocity.y || 0,
    z: entity.velocity.z || 0
  }
}

function predictPosition(entity, ticks = 1) {
  const velocity = getTargetVelocity(entity)
  return entity.position.offset(
    velocity.x * ticks,
    velocity.y * ticks,
    velocity.z * ticks
  )
}

function calculateAngle(from, to) {
  const diff = to.minus(from)
  return {
    yaw: Math.atan2(diff.z, diff.x),
    pitch: Math.atan2(diff.y, Math.sqrt(diff.x * diff.x + diff.z * diff.z))
  }
}

function canReach(bot, target, maxDistance = 50) {
  if (!target) return false
  const dist = distance(bot.entity, target)
  return dist <= maxDistance && hasLineOfSight(bot, target)
}

function chooseOptimalMovement(bot, target, preferredDistance = 3) {
  const dist = distance(bot.entity, target)
  
  if (dist > preferredDistance + 2) return 'approach'
  if (dist < preferredDistance - 1) return 'retreat'
  return 'strafe'
}

function calculateSafePoint(bot, target, safeDistance = 10) {
  const direction = bot.entity.position.minus(target.position).normalize()
  return target.position.offset(
    direction.x * safeDistance,
    0,
    direction.z * safeDistance
  )
}

module.exports = { 
  distance, 
  clamp, 
  attackDelay, 
  hasLineOfSight, 
  isUnsafeBlock, 
  chooseTarget, 
  sleep,
  getTargetVelocity,
  predictPosition,
  calculateAngle,
  canReach,
  chooseOptimalMovement,
  calculateSafePoint
}
