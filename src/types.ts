export const SKIP = Symbol()


export class Bundle {
  content: any [] = []

  constructor(...vals: any[]) {
    this.content = vals
  }

  push(val: any) {
    this.content.push(val)
  }

  prune() {
    if (this.content.length === 0) {
      return SKIP
    } else if (this.content.length === 1) {
      return this.content[0]
    } else {
      return this
    }
  }
}

