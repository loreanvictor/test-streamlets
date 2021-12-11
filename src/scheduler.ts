export type Scheduler = (fn: () => void, time: number) => () => void


export function timeout(step = 100): Scheduler {
  return (fn: () => void, time: number) => {
    const to = setTimeout(fn, time * step)

    return () => clearTimeout(to)
  }
}
