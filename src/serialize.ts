import { SKIP, END, ERROR, Bundle } from './emission'
import { EmitSchedule } from './emit'


function serializeOne(v: any): string {
  if (v === SKIP) {
    return '-'
  } else if (v === END) {
    return '|'
  } else if (v === ERROR) {
    return 'X'
  } else if (Array.isArray(v)) {
    return `[${v.map(serializeOne).join(',')}]`
  } else if (v instanceof Bundle) {
    return v.content.map(serializeOne).join(',')
  } else if (v !== undefined && v !== null) {
    return v.toString()
  } else {
    return ' '
  }
}


export function serialize(schedule: EmitSchedule) {
  return schedule.map(serializeOne).join('-')
}
