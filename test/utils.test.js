const test = require('node:test')
const assert = require('node:assert/strict')
const { attackDelay, clamp, isUnsafeBlock } = require('../utils')

test('attack delay follows weapon timing and mode', () => {
  assert.equal(attackDelay('sword', 'training'), 625)
  assert.ok(attackDelay('axe', 'defensive') > attackDelay('axe', 'aggressive'))
})

test('clamp keeps movement values bounded', () => {
  assert.equal(clamp(2, 0, 1), 1)
  assert.equal(clamp(-1, 0, 1), 0)
  assert.equal(clamp(0.5, 0, 1), 0.5)
})

test('unsafe blocks are detected for movement checks', () => {
  assert.equal(isUnsafeBlock({ name: 'lava' }), true)
  assert.equal(isUnsafeBlock({ name: 'stone' }), false)
})
