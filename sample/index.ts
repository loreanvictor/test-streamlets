import { useFakeTimers } from 'sinon'
import { interval } from 'streamlets'

import { src, record, START, SKIP, STOP, PULL, serialize, Bundle } from '../src'

const clock = useFakeTimers()

// const S = src([SKIP, SKIP, 'a', SKIP, new Bundle('b', 'e'), SKIP, 'c', SKIP, END])
record(
  interval(100),
  '-->-----------|--------->---'
)
  .then(serialize)
  .then(console.log)

clock.tick(10000)
clock.restore()
