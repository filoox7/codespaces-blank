class Stats {
  constructor() { this.reset() }
  reset() { this.hits = 0; this.attempts = 0; this.wins = 0; this.losses = 0; this.errors = 0 }
  accuracy() { return this.attempts ? this.hits / this.attempts : 0 }
  snapshot() { return { ...this, accuracy: Number(this.accuracy().toFixed(3)) } }
}
module.exports = Stats
