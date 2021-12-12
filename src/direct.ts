import { Observation } from 'streamlets'

import { schedule } from './schedule'
import { Scheduler, timeout } from './scheduler'
import { SKIP, Bundle } from './types'
import { parser } from './parser'


export const START = Symbol()
export const STOP = Symbol()
export const PULL = Symbol()

export type RecordingSchedule = (Bundle | typeof SKIP | typeof START | typeof STOP | typeof PULL)[]


function parse(s: string) {
  return parser(
    token => {
      if (token.content === '>') {
        return START
      } else if (token.content === '|') {
        return STOP
      } else if (token.content === 'V') {
        return PULL
      }
    }
    , false
  )(s)
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
