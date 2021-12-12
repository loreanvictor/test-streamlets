import { debounce, pipe, map, filter } from 'streamlets'
import { src, record, T, serialize } from '../src'

record(
  pipe(
    src(T('--1-2---3, (4)---|')),
    debounce(100),
    filter(x => x > 3),
    map(x => x * 10),
  )
)
  .then(serialize)
  .then(console.log)

