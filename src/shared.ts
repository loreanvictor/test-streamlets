import { Subject } from 'streamlets'

import { emit, EmitSchedule } from './emit'
import { Scheduler, timeout } from './scheduler'


export function shared(s: EmitSchedule | string, scheduler: Scheduler = timeout()) {
  const subject = new Subject<any>()
  emit(s, subject, scheduler)

  return subject
}
