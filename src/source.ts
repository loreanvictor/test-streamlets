import { source, talkback } from 'streamlets'

import { emit, EmitSchedule } from './emit'
import { Scheduler, timeout } from './scheduler'


export function src(s: EmitSchedule, scheduler: Scheduler = timeout()) {
  return source(sink => {
    let started = false

    sink.greet(talkback({
      start() { started = true },
      stop() { started = false}
    }))

    emit(s, sink, scheduler, () => started)
  })
}
