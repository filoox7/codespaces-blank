const CombatModule = require('./base')
const { attackDelay, sleep, distance, predictPosition } = require('../utils')

class MeleeModule extends CombatModule {
  constructor(bot, config, stats, weapon) { 
    super(bot, config, stats)
    this.weapon = weapon
    this.name = `${weapon}-only`
    this.lastStrafe = 0
    this.strafeDirection = 1
    this.dodgeCounter = 0
  }

  async tick() {
    if (!this.target || !this.isValidTarget()) return this.stop()
    
    const dist = distance(this.bot.entity, this.target)
    
    // الحركة الذكية
    await this.smartMovement(dist)
    
    // التهيئة الدفاعية
    await this.defensiveAwareness(dist)
    
    // النظر مع التنبؤ
    await this.predictiveAim()
    
    // الهجوم المتقدم
    await this.advancedAttack()
    
    // الاستشفاء التلقائي
    await this.autoHeal()
    
    // استخدام الجرعات
    await this.usePotions()
    
    await sleep(this.reactionTime)
  }

  async smartMovement(dist) {
    const optimalRange = 3.0
    const now = Date.now()
    
    if (dist > optimalRange + 1.5) {
      // اقترب بذكاء
      await this.approachTarget()
    } else if (dist < optimalRange - 0.5) {
      // ابتعد قليلاً
      await this.backawayFromTarget()
    } else {
      // الحركة الجانبية (Strafing)
      if (now - this.lastStrafe > 500) {
        this.strafeDirection *= -1
        this.lastStrafe = now
      }
      await this.strafeAroundTarget()
    }
  }

  async defensiveAwareness(dist) {
    // تجنب الخطر عندما تكون الصحة منخفضة
    if (this.bot.health < this.config.combat.retreatHealth + 5) {
      this.dodgeCounter++
      if (this.dodgeCounter > 3) {
        await this.backawayFromTarget()
        this.dodgeCounter = 0
      }
    }
  }

  async predictiveAim() {
    try {
      const predicted = predictPosition(this.target, 0.5)
      const headPos = predicted.offset(0, this.target.height * 0.85, 0)
      await this.bot.lookAt(headPos, true)
    } catch (error) {
      // نسخ احتياطي
      await this.bot.lookAt(this.target.position.offset(0, this.target.height * 0.85, 0), true)
    }
  }

  async advancedAttack() {
    const now = Date.now()
    const delay = this.getAttackDelay()
    
    if (now - this.lastAttack < delay) return
    
    const dist = distance(this.bot.entity, this.target)
    if (dist > this.config.combat.attackRange) return
    
    try {
      // محاولة Critical Hit (في 30% من الحالات)
      if (Math.random() < 0.3 && this.bot.entity.isCollidedHorizontally === false) {
        await this.attemptCritical()
      }
      
      await this.bot.attack(this.target)
      this.lastAttack = now
      this.stats.hits++
      this.comboCount++
    } catch (error) {
      this.stats.misses++
    }
  }

  async attemptCritical() {
    try {
      // قفزة + هجوم = Critical Hit
      await this.bot.setControlState('jump', true)
      await sleep(80)
      await this.bot.setControlState('jump', false)
    } catch (error) {
      // تجاهل الأخطاء
    }
  }

  async autoHeal() {
    if (this.bot.health > this.config.combat.retreatHealth + 2) return
    if (Date.now() - this.lastHealed < 1000) return
    
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

  async usePotions() {
    if (Date.now() - this.lastStrengthPotion < 12000) return
    
    try {
      const strengthPotion = this.bot.inventory.items().find(item => 
        item.name.includes('strength')
      )
      
      if (strengthPotion) {
        await this.bot.equip(strengthPotion, 'hand')
        await this.bot.activateItem()
        this.lastStrengthPotion = Date.now()
      }
    } catch (error) {
      // تجاهل
    }
  }

  async approachTarget() {
    try {
      if (this.bot.pathfinder) {
        const { Movements, goals } = require('mineflayer-pathfinder')
        const movements = new Movements(this.bot)
        this.bot.pathfinder.setMovements(movements)
        const goal = new goals.GoalNear(this.target.position.x, this.target.position.y, this.target.position.z, 2.5)
        await this.bot.pathfinder.goto(goal).catch(() => {})
      }
    } catch (error) {
      // تجاهل
    }
  }

  async backawayFromTarget() {
    try {
      const direction = this.bot.entity.position.minus(this.target.position).normalize()
      const newPos = this.bot.entity.position.offset(direction.x * 2, 0, direction.z * 2)
      
      if (this.bot.pathfinder) {
        const { goals } = require('mineflayer-pathfinder')
        const goal = new goals.GoalNear(newPos.x, newPos.y, newPos.z, 0.5)
        await this.bot.pathfinder.goto(goal).catch(() => {})
      }
    } catch (error) {
      // تجاهل
    }
  }

  async strafeAroundTarget() {
    try {
      const angle = this.strafeDirection * 1.5
      const distance = 3.5
      const offsetX = Math.cos(angle) * distance
      const offsetZ = Math.sin(angle) * distance
      
      const newPos = this.target.position.offset(offsetX, 0, offsetZ)
      
      if (this.bot.pathfinder) {
        const { goals } = require('mineflayer-pathfinder')
        const goal = new goals.GoalNear(newPos.x, newPos.y, newPos.z, 0.5)
        await this.bot.pathfinder.goto(goal).catch(() => {})
      }
    } catch (error) {
      // تجاهل
    }
  }

  getAttackDelay() {
    return attackDelay(this.weapon, this.bot.pvpMode)
  }
}

module.exports = MeleeModule
