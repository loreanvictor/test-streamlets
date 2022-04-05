import { useFakeTimers } from 'sinon'
import { buffer } from 'streamlets'

import { record, src, timeline } from '..'


describe('buffer()', () => {
  it('should buffer incoming emissions and wait for them to be pulled.', done => {
    const clock = useFakeTimers()

    const S =      src('--1-2---3-4-5-------6-7-|')
    const O =          '>-----V-----V-V-V-V-------V'
    const E = timeline('------1-----3-4-5---6-----7,|')

    record(buffer(S, 3), O).then(actual => {
      actual.should.eql(E)
      done()
    })

    clock.tick(10000)
    clock.restore()
  })

  it('should pass down errors.', done => {
    const clock = useFakeTimers()

    const S =      src('--X')
    const O =          '>-----'
    const E = timeline('--X')

    record(buffer(S, 3), O).then(actual => {
      actual.should.eql(E)
      done()
    })

    clock.tick(10000)
    clock.restore()
  })

  it('should be pausable / resumable.', done => {
    const clock = useFakeTimers()

    const S =      src('--1---2---3-')
    const O =          '>---|--->---V-V'
    const E = timeline('------------1-3')

    record(buffer(S, 3), O).then(actual => {
      actual.should.eql(E)
      done()
    })

    clock.tick(10000)
    clock.restore()
  })
})
