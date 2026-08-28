module.exports = {
  // Keep this pointed at a private/local practice server.
  server: {
    host: process.env.MC_HOST || '127.0.0.1',
    port: Number(process.env.MC_PORT || 25565),
    username: process.env.MC_USERNAME || 'PvPTrainingBot',
    version: process.env.MC_VERSION || false
  },
  combat: {
    responseMs: 120,
    attackRange: 3.1,
    hitSensitivity: 0.82,
    retreatHealth: 12,
    retargetMs: 8000,
    maxActionRetries: 2
  },
  potions: ['swiftness', 'strength', 'healing'],
  allowedModes: ['aggressive', 'defensive', 'training'],
  allowedTypes: ['sword', 'axe', 'crystal', 'bow', 'hybrid', 'sumo', 'nethpot']
}
