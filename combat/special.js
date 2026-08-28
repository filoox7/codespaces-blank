const CombatModule = require('./base')
const { sleep, attackDelay } = require('../utils')

class SpecialModule extends CombatModule {
  constructor(bot, config, stats, type) { super(bot, config, stats); this.type = type; this.name = type }
  async tick() {
    if (!this.target) return this.stop()
    await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.5, 0), true)
    if (this.type === 'crystal' && typeof this.bot.placeBlock === 'function') {
      // Placement is intentionally delegated to a private-server loadout/plugin.
      await this.bot.chat('/training crystal-placement')
    } else if (this.type === 'sumo') {
      this.bot.setControlState('sprint', true)
      this.bot.setControlState('forward', true)
    } else if (this.type === 'hybrid' || this.type === 'nethpot') {
      await this.attack()
    }
    await sleep(attackDelay(this.type, this.bot.pvpMode))
  }
}
module.exports = SpecialModule
