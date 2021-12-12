import { useFakeTimers } from 'sinon'
import { buffer } from 'streamlets'

import { record, src, T } from '..'


describe('buffer()', () => {
  it('should buffer incoming emissions and wait for them to be pulled.', done => {
    const clock = useFakeTimers()

    const timeline    = '--1-2---3-4-5-------6-7-|'
    const observation = '>-----V-----V-V-V-V-------V'
    const expected    = '------1-----3-4-5---6-----7,|'

    record(
      buffer(src(T(timeline)), 3),
      observation
    ).then(actual => {
      actual.should.eql(T(expected))
      done()
    })

    clock.tick(10000)
    clock.restore()
  })

  it('should pass down errors.', done => {
    const clock = useFakeTimers()

    const timeline    = '--X'
    const observation = '>-----'
    const expected    = '--X'

    record(
      buffer(src(T(timeline)), 3),
      observation
    ).then(actual => {
      actual.should.eql(T(expected))
      done()
    })

    clock.tick(10000)
    clock.restore()
  })

  it('should be pausable / resumable.', done => {
    const clock = useFakeTimers()

    const timeline    = '--1---2---3-'
    const observation = '>---|--->---V-V'
    const expected    = '------------1-3'

    record(
      buffer(src(T(timeline)), 3),
      observation
    ).then(actual => {
      actual.should.eql(T(expected))
      done()
    })

    clock.tick(10000)
    clock.restore()
  })
})
