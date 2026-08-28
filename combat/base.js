const { sleep, distance, hasLineOfSight, predictPosition } = require('../utils')

class CombatModule {
  constructor(bot, config, stats) {
    this.bot = bot
    this.config = config
    this.stats = stats
    this.target = null
    this.running = false
    this.name = 'base'
    this.lastAttack = 0
    this.lastHealed = 0
    this.lastStrengthPotion = 0
    this.comboCount = 0
    this.reactionTime = config.ai?.reactionTime || 30
  }

  async run(target) {
    if (!target) return
    this.target = target
    this.running = true
    
    while (this.running && this.target && this.isValidTarget()) {
      try {
        await this.tick()
      } catch (error) {
        this.stats.errors++
      }
    }
    this.stop()
  }

  isValidTarget() {
    if (!this.target || this.target.isDead) return false
    if (distance(this.bot.entity, this.target) > 256) return false
    return hasLineOfSight(this.bot, this.target)
  }

  async attack() {
    const now = Date.now()
    const delay = this.getAttackDelay()
    if (now - this.lastAttack < delay) return
    
    try {
      await this.bot.attack(this.target)
      this.lastAttack = now
      this.stats.hits++
      this.comboCount++
    } catch (error) {
      this.stats.misses++
      this.stats.errors++
    }
  }

  getAttackDelay() {
    return 100
  }

  stop() {
    this.running = false
    this.target = null
    this.comboCount = 0
  }

  async tick() {
    // يتم تطبيقه في الفئات المشتقة
  }
}

module.exports = CombatModule
