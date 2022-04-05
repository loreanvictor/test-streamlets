import { replay } from 'streamlets'
import { shared, recordAll, serialize } from '../src'

// const SRC = '--1---2---3-'
// const REQ = '>---|--->---V-V'
// //           ------------1-3


recordAll(
  replay(shared('--1---2-|')),
  [             '>---------'
    ,           '---->-----']
).then(r => r.map(serialize))
  .then(console.log)

