function distance(a, b) {
  return a.position.distanceTo(b.position)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function attackDelay(weapon, mode = 'training') {
  const base = { sword: 625, axe: 1000, bow: 850, crystal: 900, hybrid: 700, sumo: 500, nethpot: 625 }[weapon] || 700
  const modifier = mode === 'defensive' ? 1.15 : mode === 'aggressive' ? 0.95 : 1
  return Math.round(base * modifier)
}

function hasLineOfSight(bot, entity) {
  if (!bot.entity || !entity) return false
  const origin = bot.entity.position.offset(0, bot.entity.height * 0.9, 0)
  const target = entity.position.offset(0, entity.height * 0.5, 0)
  const direction = target.minus(origin)
  const block = bot.world.raycast(origin, direction.normalize(), Math.ceil(direction.norm()))
  return !block || block.position.distanceTo(origin) >= direction.norm() - 0.35
}

function isUnsafeBlock(block) {
  return !block || block.name === 'lava' || block.name === 'fire' || block.name === 'cactus'
}

function chooseTarget(bot) {
  return Object.values(bot.entities)
    .filter(entity => entity.type === 'player' && entity.username !== bot.username)
    .sort((a, b) => distance(a, bot.entity) - distance(b, bot.entity))[0] || null
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { distance, clamp, attackDelay, hasLineOfSight, isUnsafeBlock, chooseTarget, sleep }
