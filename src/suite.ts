import { Source } from 'streamlets'

import { Scheduler } from './scheduler'
import { shared } from './shared'
import { src } from './source'
import { record } from './record'
import { RecordingSchedule } from './direct'
import { EmitSchedule } from './emit'


export function suite(scheduler: Scheduler) {
  return {
    shared: (s: EmitSchedule) => shared(s, scheduler),
    src: (s: EmitSchedule) => src(s, scheduler),
    record: (S: Source<any>, s?: RecordingSchedule | string) => record(S, s, scheduler),
  }
}
