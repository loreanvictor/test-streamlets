import { Observation } from 'streamlets'
import { schedule, Scheduler, timeout } from '.'

import { SKIP, Bundle } from './emission'


export const START = Symbol()
export const STOP = Symbol()
export const PULL = Symbol()

export type RecordingSchedule = (Bundle | typeof SKIP | typeof START | typeof STOP | typeof PULL)[]


function parse(s: string) {
  let i = 0
  let current: string
  const res: Bundle[] = [new Bundle()]

  while ((current = s[i])) {
    let skipped = false
    const bundle = res[res.length - 1]

    if (current === '>') {
      bundle.push(START)
    } else if (current === 'V') {
      bundle.push(PULL)
    } else if (current === '|') {
      bundle.push(STOP)
    } else if (current === '-') {
      bundle.push(SKIP)
      skipped = true
    } else {
      throw new Error('unexpected symbol')
    }

    const next = s[i + 1]
    if (!next) {
      break
    }

    if (next === '-') {
      res.push(new Bundle())
      i += 2
    } else if (next === ',') {
      if (skipped) {
        throw new Error('cannot bundle a skip')
      }

      const lookahead = s[i + 2]
      if (!lookahead || !['>', 'V', '|'].includes(lookahead)) {
        throw new Error('unexpected symbol')
      }

      i += 2
    } else {
      throw new Error('unexpected symbol')
    }
  }

  return res.map(b => b.prune())
}


function directStep(obs: Observation<any>, step: Bundle | typeof SKIP | typeof START | typeof STOP | typeof PULL) {
  if (step === START) {
    obs.start()
  } else if (step === STOP) {
    obs.stop()
  } else if (step === PULL) {
    obs.request()
  } else if (step instanceof Bundle) {
    step.content.forEach(i => directStep(obs, i))
  }
}


export function direct(
  s: RecordingSchedule | string,
  obs: Observation<any>,
  scheduler: Scheduler = timeout(),
  finalize?: () => void,
) {

  if (typeof s === 'string') {
    direct(parse(s), obs, scheduler, finalize)
  } else {
    schedule(
      s.map((step, i) => () => {
        directStep(obs, step)
        if ((i === s.length - 1) && finalize) {
          finalize()
        }
      }),
      scheduler
    )
  }
}
