const CombatModule = require('./base')
const { attackDelay, sleep } = require('../utils')

class RangedModule extends CombatModule {
  constructor(bot, config, stats) { super(bot, config, stats); this.name = 'bow' }
  async tick() {
    if (!this.target) return this.stop()
    await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.7, 0), true)
    if (typeof this.bot.activateItem === 'function') {
      await this.bot.activateItem()
      await sleep(650)
      this.bot.deactivateItem()
    }
    await sleep(attackDelay('bow', this.bot.pvpMode))
  }
}
module.exports = RangedModule
