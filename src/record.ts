import { Source, tap, finalize, pipe, observe, observeLater, Deferred } from 'streamlets'

import { Scheduler, timeout } from './scheduler'
import { Bundle } from './types'
import { END, ERROR } from './emit'
import { direct, RecordingSchedule } from './direct'


export async function record(
  src: Source<any>,
  s?: RecordingSchedule | string,
  scheduler: Scheduler = timeout()
) {
  const deferred = new Deferred<any[]>()

  const res: Bundle[] = [new Bundle()]
  let disposed = false
  let finished = false

  const obs = pipe(
    src,
    tap(v => {
      if (!(disposed || finished)) {
        res[res.length - 1].push(v)
      }
    }),
    finalize(e => {
      disposed = true
      if (e) {
        res[res.length - 1].push(ERROR)
      } else {
        res[res.length - 1].push(END)
      }

      deferred.resolve(res)
    }),
    s ? observeLater : observe
  )

  if (s) {
    direct(s, obs, scheduler, () => finished = true)
  }

  let cleanup: () => void

  const step = () => {
    if (disposed || finished) {
      if (cleanup) {
        cleanup()
      }

      if (!disposed) {
        deferred.resolve(res)
      }
    } else {
      res.push(new Bundle())
      cleanup = scheduler(step, 1)
    }
  }

  step()

  await deferred.promise

  return res.map(b => b.prune())
}


export async function recordAll(
  src: Source<any>,
  ss: (RecordingSchedule | string)[],
  scheduler: Scheduler = timeout()
) {
  return Promise.all(ss.map(s => record(src, s, scheduler)))
}
