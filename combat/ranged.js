const CombatModule = require('./base')
const { attackDelay, sleep, distance, predictPosition } = require('../utils')

class RangedModule extends CombatModule {
  constructor(bot, config, stats) { 
    super(bot, config, stats)
    this.name = 'bow'
    this.lastArrowShot = 0
    this.chargeLevel = 0
    this.repositionCooldown = 0
  }

  async tick() {
    if (!this.target || !this.isValidTarget()) return this.stop()
    
    const dist = distance(this.bot.entity, this.target)
    
    // البقاء على مسافة آمنة
    await this.maintainDistance(dist)
    
    // التنقل الذكي
    await this.intelligentRepositioning(dist)
    
    // حساب المسار بتنبؤ دقيق
    await this.calculateAdvancedTrajectory()
    
    // إطلاق السهم مع حساب القوة
    await this.shootWithIntegence()
    
    // الاستشفاء التلقائي
    await this.autoHeal()
    
    await sleep(this.reactionTime)
  }

  async maintainDistance(dist) {
    const safeDistance = 25
    const minDistance = 12
    const optimalDistance = 20
    
    if (dist < minDistance) {
      await this.moveAway(this.target, 5)
    } else if (dist > safeDistance) {
      await this.moveTowards(this.target, optimalDistance)
    }
  }

  async intelligentRepositioning(dist) {
    // إعادة تموضع كل 3 ثواني للتكيف مع حركة الهدف
    const now = Date.now()
    if (now - this.repositionCooldown > 3000) {
      if (Math.random() < 0.5) {
        await this.moveToCirclingPosition()
      }
      this.repositionCooldown = now
    }
  }

  async calculateAdvancedTrajectory() {
    try {
      const dist = distance(this.bot.entity, this.target)
      const velocity = this.target.velocity || { x: 0, y: 0, z: 0 }
      
      // حساب زمن الرحلة تقريبياً
      const timeToTarget = dist / 20
      
      // التنبؤ بموضع الهدف
      const predicted = this.target.position.offset(
        velocity.x * timeToTarget * 0.6,
        Math.max(0, velocity.y * timeToTarget * 0.3) - (9.8 * timeToTarget * timeToTarget / 2),
        velocity.z * timeToTarget * 0.6
      )
      
      const headPos = predicted.offset(0, this.target.height * 0.9, 0)
      await this.bot.lookAt(headPos, true)
    } catch (error) {
      // استخدام النظر البسيط
      await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.9, 0), true)
    }
  }

  async shootWithIntegence() {
    const now = Date.now()
    const baseDelay = this.getAttackDelay()
    const dist = distance(this.bot.entity, this.target)
    
    if (now - this.lastArrowShot < baseDelay) return
    if (dist > 120) return
    
    try {
      // حساب وقت الشحن بناءً على المسافة
      const chargeTime = this.calculateChargeTime(dist)
      
      if (typeof this.bot.activateItem === 'function') {
        await this.bot.activateItem()
        await sleep(chargeTime)
        this.bot.deactivateItem()
        
        this.lastArrowShot = now
        this.stats.hits++
      }
    } catch (error) {
      this.stats.misses++
    }
  }

  calculateChargeTime(distance) {
    // الحد الأدنى: 200ms، الحد الأقصى: 650ms
    const minCharge = 200
    const maxCharge = 650
    const maxDistance = 120
    
    // المزيد من المسافة = المزيد من الشحن
    const chargePercentage = Math.min(1, distance / maxDistance)
    return minCharge + (maxCharge - minCharge) * chargePercentage
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

  async moveToCirclingPosition() {
    try {
      const angle = Math.random() * Math.PI * 2
      const circleRadius = 18
      
      const circlePos = this.target.position.offset(
        Math.cos(angle) * circleRadius,
        0,
        Math.sin(angle) * circleRadius
      )
      
      if (this.bot.pathfinder) {
        const { goals } = require('mineflayer-pathfinder')
        const goal = new goals.GoalNear(circlePos.x, circlePos.y, circlePos.z, 1)
        await this.bot.pathfinder.goto(goal).catch(() => {})
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

  async moveAway(target, distance) {
    try {
      const direction = this.bot.entity.position.minus(target.position).normalize()
      const newPos = this.bot.entity.position.offset(direction.x * distance, 0, direction.z * distance)
      
      if (this.bot.pathfinder) {
        const { goals } = require('mineflayer-pathfinder')
        const goal = new goals.GoalNear(newPos.x, newPos.y, newPos.z, 1)
        await this.bot.pathfinder.goto(goal).catch(() => {})
      }
    } catch (error) {
      // تجاهل
    }
  }

  getAttackDelay() {
    return attackDelay('bow', this.bot.pvpMode)
  }
}

module.exports = RangedModule
