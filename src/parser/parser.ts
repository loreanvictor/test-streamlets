import { tokenize, Token } from './tokenize'
import { Bundle, SKIP } from '../types'


export type Semantics = (token: Token) => any


function map(tokens: Token[], semantics: Semantics, allowArrays = true): any[] {
  const res: any[] = []

  tokens.forEach(token => {
    if (token.type === 'array') {
      if (!allowArrays) {
        throw new Error('Arrays are not allowed in this context')
      }

      res.push(map(token.children, semantics, true))
    } else if (token.type === 'bundle') {
      res.push(new Bundle(...map(token.children, semantics, allowArrays)))
    } else if (token.type === 'skip') {
      res.push(SKIP)
    } else if (token.type !== 'sep') {
      res.push(semantics(token))
    }
  })

  return res
}


export function parser(semantics: Semantics, allowArrays = true) {
  return (...pieces: (string | any)[]) => {
    let res: any[] = []

    pieces.forEach(piece => {
      if (typeof piece === 'string') {
        res = res.concat(map(tokenize(piece), semantics, allowArrays))
      } else {
        res.push(piece)
      }
    })

    return res
  }
}
