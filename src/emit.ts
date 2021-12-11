import { Sink } from 'streamlets'

import { schedule } from './schedule'
import { Scheduler, timeout } from './scheduler'

import { Emission, SKIP, END, ERROR, Bundle } from './emission'


export type EmitSchedule = Emission[]


function emitOne(s: Sink<any>, e: Emission, gate?: () => boolean) {
  if (gate && !gate()) {
    return
  }

  if (e === SKIP) {
    return
  } else if (e === END) {
    s.end()
  } else if (e === ERROR) {
    s.end(new Error())
  } else if (e instanceof Bundle) {
    e.content.forEach(i => emitOne(s, i, gate))
  } else {
    s.receive(e)
  }
}


export function emit(
  s: EmitSchedule,
  sink: Sink<any>,
  scheduler: Scheduler = timeout(),
  gate?: () => boolean
) {
  schedule(
    s.map(e => () => emitOne(sink, e, gate)),
    scheduler
  )
}
