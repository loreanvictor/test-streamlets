
<div align="center">

<img src="https://raw.githubusercontent.com/loreanvictor/streamlet/main/misc/logo-lines.svg" width="256px"/>
  
# Marble Testing for Streamlets

```bash
npm i test-streamlets
```
  
</div>

<br/>

Marble testing is a useful technique to quickly test behavior of reactive streams by specifying a timeline for events. `test-streamlets` library provides
test-runner/framework agnostic utilities for marble testing [streamlets](https://github.com/loreanvictor/streamlet):

```ts
import { buffer } from 'streamlets'
import { record, src, serialize } from 'test-streamlets'

const timeline    = '--1-2---3-4-5-------6-7-|'       // this is our source's emission timeline
const observation = '>-----V-----V-V-V-V-------V'     // this is our sink's behavior timeline
const expected    = '------1-----3-4-5---6-----7,|'   // this is how we expect the end result will be

const source = src(timeline)                          // create a source from the timeline
const buffered = buffer(source, 3)                    // buffer the source
const recording = await record(buffered, observation) // record behavior of buffered source using given observation timeline

expect(serialize(recording)).to.eql(T(expected))      // assert that the recording matches our expected timeline
```
