const CombatModule = require('./base')
const { attackDelay, sleep } = require('../utils')

class MeleeModule extends CombatModule {
  constructor(bot, config, stats, weapon) { super(bot, config, stats); this.weapon = weapon; this.name = `${weapon}-only` }
  async tick() {
    if (!this.target) return this.stop()
    await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.6, 0), true)
    await this.attack()
    await sleep(attackDelay(this.weapon, this.bot.pvpMode))
  }
}
module.exports = MeleeModule
