/* istanbul ignore file */

import chalk from 'chalk'
import { Token } from './tokenize'


function indentStr(n: number): string {
  return chalk`{gray ..}`.repeat(n)
}


export function logTokens(tokens: Token[], indent = 0) {
  tokens.forEach(token => {
    console.log(`${indentStr(indent)}${token.content || chalk`{blue ${token.type}}`}`)
    if (token.children) {
      logTokens(token.children, indent + 1)
    }
  })
}
