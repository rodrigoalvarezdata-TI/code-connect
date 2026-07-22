import axe, { type AxeResults, type Result, type RunOptions } from 'axe-core'
import { expect } from 'vitest'

/**
 * Tags do axe-core que cobrem WCAG 2.1 nível AA (inclui A, já que AA o exige).
 * `best-practice` fica de fora de propósito: não é requisito da norma.
 */
const WCAG_21_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/**
 * Roda o axe-core sobre um container renderizado, restrito às regras WCAG 2.1 AA.
 *
 * Observação: em jsdom não há layout nem canvas, então a regra `color-contrast`
 * não consegue ser avaliada (sai como "incomplete", não como violação).
 * Contraste precisa ser verificado em navegador real.
 */
export async function runA11y(
  container: Element,
  options: RunOptions = {},
): Promise<AxeResults> {
  return axe.run(container, {
    runOnly: { type: 'tag', values: WCAG_21_AA_TAGS },
    ...options,
  })
}

function formatViolations(violations: Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `      - ${node.html}\n        ${node.failureSummary?.replace(/\n/g, '\n        ')}`)
        .join('\n')
      return [
        `  [${violation.impact ?? 'n/a'}] ${violation.id}: ${violation.help}`,
        `    ${violation.helpUrl}`,
        nodes,
      ].join('\n')
    })
    .join('\n\n')
}

expect.extend({
  toHaveNoA11yViolations(results: AxeResults) {
    const { violations } = results
    return {
      pass: violations.length === 0,
      actual: violations,
      message: () =>
        violations.length === 0
          ? 'Esperava violações de acessibilidade, mas nenhuma foi encontrada.'
          : `${violations.length} violação(ões) de acessibilidade WCAG 2.1 AA:\n\n${formatViolations(violations)}`,
    }
  },
})

declare module 'vitest' {
  interface Matchers<T = any> {
    toHaveNoA11yViolations: () => T
  }
}
