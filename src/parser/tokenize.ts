import chalk from 'chalk'


export class Token {
  children: Token[] = []
  content = ''

  constructor(
    readonly type: 'skip' | 'paran' | 'array' | 'bundle' | 'val' | 'root' | 'sep',
    public parent?: Token
  ) {}

  clean() {
    this.content = this.content.trim()

    return this
  }
}


export class UnexpectedToken extends Error {
  constructor(
    readonly token: string,
    readonly position: number,
    readonly context: string,
  ) {
    super(
      `Unexpected token ${token} at position ${position} \n` +
      chalk.blue(context.substring(0, position))
      + chalk.red.bold(context[position])
      + chalk.blue(context.substring(position + 1, context.length))
    )
  }
}


export class UnclosedExpression extends Error {
  constructor(readonly context: string) {
    super('Unclosed expression\n' + chalk.blue(context))
  }
}


export function tokenize(timeline: string) {
  const root = new Token('root')
  const stack = [root]
  let i = 0
  let current: string

  while ((current = timeline[i])) {
    const next = timeline[i + 1]
    const top = stack[stack.length - 1]
    const parent = stack[stack.length - 2]

    if (top.type === 'paran') {
      if (current === ')') {
        stack.pop()
        parent.children.push(top)
      } else {
        top.content += current
      }
    } else if (current === '(') {
      if (top.type !== 'root' && top.type !== 'bundle' && top.type !== 'array') {
        throw new UnexpectedToken(current, i, timeline)
      }

      stack.push(new Token('paran', top))
    } else if (current === '[') {
      if (top.type !== 'root' && top.type !== 'bundle' && top.type !== 'array') {
        throw new UnexpectedToken(current, i, timeline)
      }

      stack.push(new Token('array', top))
    } else if (current === ']') {
      if (!(top.type === 'array' || (top.type === 'val' && parent.type === 'array'))) {
        throw new UnexpectedToken(current, i, timeline)
      }

      stack.pop()

      if (top.type === 'val') {
        stack.pop()
        parent.children.push(top.clean())
        parent.parent?.children.push(parent)
      } else {
        parent.children.push(top.clean())
      }
    } else if (current === ',') {
      if (top.type === 'val') {
        stack.pop()
        if (parent?.type === 'root') {
          const bundle = new Token('bundle', parent)
          stack.push(bundle)
          bundle.children.push(top.clean())
        } else if (parent?.type === 'bundle' || parent?.type === 'array') {
          parent.children.push(top.clean())
        } else {
          throw new UnexpectedToken(current, i, timeline)
        }
      } else if (top.type === 'root') {
        const last = root.children[root.children.length - 1]
        if (last?.type === 'paran' || last?.type === 'array') {
          const bundle = new Token('bundle', top)
          stack.push(bundle)
          bundle.children.push(last)
          root.children.pop()
        } else {
          throw new UnexpectedToken(current, i, timeline)
        }
      } else if (top.type === 'bundle' || top.type === 'array') {
        const last = top.children[top.children.length - 1]
        if (last.type !== 'paran' && last.type !== 'array') {
          throw new UnexpectedToken(current, i, timeline)
        }
      }
    } else if (current === '-') {
      if (top.type === 'root') {
        const last = top.children[top.children.length - 1]
        if (last?.type === 'paran' || last?.type === 'array') {
          // nothing to do here
        } else {
          if (next !== '-') {
            throw new UnexpectedToken(next, i + 1, timeline)
          }

          top.children.push(new Token('skip', top))
          i++
        }
      } else {
        if (parent.type !== 'root' && parent.type !== 'bundle') {
          throw new UnexpectedToken(current, i, timeline)
        }

        stack.pop()
        parent.children.push(top.clean())
        if (parent.type === 'bundle') {
          stack.pop()
          root.children.push(parent)
        }
      }

      root.children.push(new Token('sep'))
    } else {
      if (top.type === 'val') {
        top.content += current
      } else {
        if (current !== ' ') {
          if (top.type !== 'root' && top.type !== 'bundle' && top.type !== 'array') {
            throw new UnexpectedToken(current, i, timeline)
          }

          const val = new Token('val', top)
          val.content += current
          stack.push(val)
        }
      }
    }

    i++
  }

  const remainder = stack.pop()!
  if (remainder.type === 'val') {
    remainder.parent!.children.push(remainder.clean())
    if (remainder.parent!.type === 'bundle') {
      root.children.push(remainder.parent!)
    } else if (remainder.parent!.type !== 'root') {
      throw new UnclosedExpression(timeline)
    }
  } else if (remainder.type !== 'root') {
    throw new UnclosedExpression(timeline)
  }

  return root.children
}
