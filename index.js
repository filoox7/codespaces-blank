const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const config = require('./config')
const logger = require('./logger')
const Stats = require('./stats')
const { chooseTarget, sleep } = require('./utils')
const MeleeModule = require('./combat/melee')
const RangedModule = require('./combat/ranged')
const SpecialModule = require('./combat/special')
const { createStatusServer } = require('./web')

if (process.env.MC_PUBLIC_SERVER === 'true') {
  throw new Error('This training bot refuses public-server mode. Use a private/local server.')
}

const bot = mineflayer.createBot(config.server)
let botOnline = false

bot.loadPlugin(pathfinder)
bot.pvpMode = 'training'
bot.pvpType = null
bot.stats = new Stats()
bot.combat = null

function moduleFor(type) {
  if (type === 'sword' || type === 'axe') return new MeleeModule(bot, config, bot.stats, type)
  if (type === 'bow') return new RangedModule(bot, config, bot.stats)
  return new SpecialModule(bot, config, bot.stats, type)
}

function stopCombat() {
  if (bot.combat) bot.combat.stop()
  bot.combat = null
  bot.pvpType = null
  bot.clearControlStates()
}

async function startCombat(type) {
  if (!config.allowedTypes.includes(type)) return bot.chat(`Unknown training type: ${type}`)
  stopCombat()
  const target = chooseTarget(bot)
  if (!target) return bot.chat('No player target found in the private arena.')
  bot.pvpType = type
  bot.combat = moduleFor(type)
  logger.decision('combat started', { type, target: target.username, mode: bot.pvpMode })
  bot.combat.run(target).catch(error => logger.error('combat loop stopped', error))
}

async function eatFood() {
  try {
    const food = bot.inventory.items().find(item => /bread|steak|pork|chicken|golden_apple/.test(item.name))
    if (!food) return bot.chat('No configured food in inventory.')
    await bot.equip(food, 'hand')
    await bot.consume()
  } catch (error) { bot.stats.errors++; logger.error('manual food action failed', error) }
}

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  const [command, value] = message.trim().split(/\s+/)
  if (command === '/pvp_stop') return stopCombat()
  if (command === '/pvp_stats') return bot.chat(JSON.stringify(bot.stats.snapshot()))
  if (command === '/pvp_reset') { stopCombat(); bot.stats.reset(); return bot.chat('Training state reset.') }
  if (command === '/pvp_food') return eatFood()
  if (command === '/pvp_mode') {
    if (config.allowedModes.includes(value)) bot.pvpMode = value
    return bot.chat(`Mode: ${bot.pvpMode}`)
  }
  if (command.startsWith('/pvp_')) return startCombat(command.slice(5))
})

bot.once('spawn', () => {
  botOnline = true
  bot.pathfinder.setMovements(new Movements(bot))
  bot.chat('Private PvP training bot ready.')
})
bot.on('health', () => { if (bot.health < config.combat.retreatHealth) eatFood() })
bot.on('kicked', reason => { botOnline = false; logger.info('Bot kicked', { reason }) })
bot.on('end', () => { botOnline = false; logger.info('Bot connection ended') })
bot.on('error', error => { botOnline = false; bot.stats.errors++; logger.error('Mineflayer error', error) })

const statusServer = createStatusServer(() => ({ online: botOnline }))
statusServer.server.listen(statusServer.port, statusServer.host, () => {
  logger.info('Status page listening', { host: statusServer.host, port: statusServer.port })
})

module.exports = { bot, startCombat, stopCombat, statusServer }
