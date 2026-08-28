const CombatModule = require('./base')
const { attackDelay, sleep, distance } = require('../utils')

class SpecialModule extends CombatModule {
  constructor(bot, config, stats, type) { 
    super(bot, config, stats)
    this.type = type
    this.name = type
    this.lastSpecialMove = 0
    this.lastHealed = 0
    this.lastCrystal = 0
  }

  async tick() {
    if (!this.target || !this.isValidTarget()) return this.stop()
    
    const dist = distance(this.bot.entity, this.target)
    
    if (this.type === 'crystal') {
      await this.handleCrystal(dist)
    } else if (this.type === 'hybrid') {
      await this.handleHybrid(dist)
    } else if (this.type === 'sumo') {
      await this.handleSumo(dist)
    } else if (this.type === 'nethpot') {
      await this.handleNethpot(dist)
    }
    
    await this.autoHeal()
    await sleep(this.reactionTime)
  }

  async handleCrystal(dist) {
    if (dist > 40) {
      await this.moveTowards(this.target, 25)
    }
    
    await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.8, 0), true)
    
    if (dist < 15 && Date.now() - this.lastCrystal > 2000) {
      this.lastCrystal = Date.now()
    }
    
    if (dist < 5) {
      await this.attack()
    }
  }

  async handleHybrid(dist) {
    await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.8, 0), true)
    
    if (dist > 15) {
      await this.shootArrow()
      await this.moveTowards(this.target, 12)
    } else {
      await this.meleeAttack()
    }
    
    await sleep(50)
  }

  async handleSumo(dist) {
    if (dist > 4) {
      await this.moveTowards(this.target, 3)
    } else {
      await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.7, 0), true)
      await this.meleeAttack()
      
      if (Math.random() < 0.3) {
        await this.bot.setControlState('jump', true)
        await sleep(100)
        await this.bot.setControlState('jump', false)
      }
    }
  }

  async handleNethpot(dist) {
    if (dist > 20) {
      await this.moveTowards(this.target, 15)
    } else {
      await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.8, 0), true)
      await this.meleeAttack()
    }
    
    await this.useNetherPotions()
  }

  async meleeAttack() {
    const now = Date.now()
    const delay = 625
    
    if (now - this.lastAttack < delay) return
    
    try {
      await this.bot.attack(this.target)
      this.lastAttack = now
      this.stats.hits++
    } catch (error) {
      this.stats.misses++
    }
  }

  async shootArrow() {
    const now = Date.now()
    const delay = 850
    
    if (now - this.lastAttack < delay) return
    if (distance(this.bot.entity, this.target) > 120) return
    
    try {
      if (typeof this.bot.activateItem === 'function') {
        await this.bot.activateItem()
        await sleep(600)
        this.bot.deactivateItem()
        
        this.lastAttack = now
        this.stats.hits++
      }
    } catch (error) {
      this.stats.misses++
    }
  }

  async useNetherPotions() {
    if (Date.now() - this.lastHealed < 3000) return
    
    try {
      const potion = this.bot.inventory.items().find(item => 
        item.name.includes('fire_resistance') || item.name.includes('instant_health')
      )
      
      if (potion) {
        await this.bot.equip(potion, 'hand')
        await this.bot.activateItem()
        this.lastHealed = Date.now()
      }
    } catch (error) {
      // تجاهل
    }
  }

  async autoHeal() {
    if (this.bot.health > this.config.combat.retreatHealth + 3) return
    if (Date.now() - this.lastHealed < 1500) return
    
    try {
      const food = this.bot.inventory.items().find(item => 
        /bread|steak|pork|chicken|golden_apple|suspicious_stew/.test(item.name)
      )
      
      if (food) {
        await this.bot.equip(food, 'hand')
        await this.bot.consume()
        this.lastHealed = Date.now()
        this.stats.heals++
      }
    } catch (error) {
      // تجاهل
    }
  }

  async moveTowards(target, distance) {
    try {
      if (this.bot.pathfinder) {
        const { Movements, goals } = require('mineflayer-pathfinder')
        const movements = new Movements(this.bot)
        this.bot.pathfinder.setMovements(movements)
        const goal = new goals.GoalNear(target.position.x, target.position.y, target.position.z, distance)
        await this.bot.pathfinder.goto(goal).catch(() => {})
      }
    } catch (error) {
      // تجاهل
    }
  }

  async attack() {
    const now = Date.now()
    if (now - this.lastAttack < 625) return
    
    try {
      await this.bot.attack(this.target)
      this.lastAttack = now
      this.stats.hits++
    } catch (error) {
      this.stats.misses++
    }
  }
}

module.exports = SpecialModule
