import { timeout, Scheduler } from './scheduler'


export type Schedule = ((() => void) | undefined)[]


export function schedule(s: Schedule, scheduler: Scheduler = timeout()) {
  s.forEach((step, index) => {
    if (step) {
      scheduler(step, index)
    }
  })
}

