module.exports = {
  server: {
    host: process.env.MC_HOST || 'filoox.play.hosting',
    port: Number(process.env.MC_PORT || 25565),
    username: process.env.MC_USERNAME || 'PvPTrainingBot',
    version: process.env.MC_VERSION || false
  },
  combat: {
    responseMs: 30,
    attackRange: 3.5,
    hitSensitivity: 0.95,
    retreatHealth: 6,
    retargetMs: 2000,
    maxActionRetries: 3,
    predictiveAiming: true,
    adaptiveDifficulty: true,
    aggressiveStyle: true,
    comboAttacks: true,
    criticalChance: 0.30
  },
  potions: ['swiftness', 'strength', 'healing', 'fire_resistance', 'night_vision'],
  allowedModes: ['aggressive', 'defensive', 'training', 'hardcore'],
  allowedTypes: ['sword', 'axe', 'crystal', 'bow', 'hybrid', 'sumo', 'nethpot'],
  ai: {
    enabled: true,
    reactionTime: 25,
    strategySwitchChance: 0.20,
    rangeAdaptation: true,
    healthAwareness: true,
    predictiveMovement: true,
    strafeEnabled: true,
    dodgeEnabled: true
  },
  advancedStats: {
    trackCriticals: true,
    trackCombos: true,
    trackDodges: true,
    trackHeals: true
  }
}
