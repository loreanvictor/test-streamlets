import { assert } from 'console'
import { buffer, pipe } from 'streamlets'
import { src, record, T, serialize } from '../src'

// const SRC = '--1---2---3-'
// const REQ = '>---|--->---V-V'
// //           ------------1-3


record(
  pipe(
    src(T('--1-2---3-4-5-------6-7-|')),
    buffer(3),
  ),      '>-----V-----V-V-V-V-------V')
  .then(serialize)
  .then(r => {
    assert(r ===
          '------1-----3-4-5---6-----7,|')
  })
