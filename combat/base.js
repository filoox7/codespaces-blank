const { sleep, distance, hasLineOfSight } = require('../utils')
const logger = require('../logger')

class CombatModule {
  constructor(bot, config, stats) {
    this.bot = bot
    this.config = config
    this.stats = stats
    this.running = false
    this.target = null
  }

  async run(target) {
    this.target = target
    this.running = true
    while (this.running && this.target?.isValid) {
      try { await this.tick() } catch (error) {
        this.stats.errors++
        logger.error(`${this.name} tick failed`, error)
        await sleep(this.config.combat.responseMs)
      }
    }
  }

  stop() { this.running = false }

  async tick() { throw new Error('CombatModule.tick must be implemented') }

  async attack() {
    if (!this.target || distance(this.bot.entity, this.target) > this.config.combat.attackRange) return false
    if (!hasLineOfSight(this.bot, this.target)) return false
    for (let attempt = 0; attempt <= this.config.combat.maxActionRetries; attempt++) {
      try {
        this.stats.attempts++
        await this.bot.attack(this.target)
        this.stats.hits++
        return true
      } catch (error) {
        if (attempt === this.config.combat.maxActionRetries) throw error
        await sleep(60 * (attempt + 1))
      }
    }
    return false
  }
}
module.exports = CombatModule
