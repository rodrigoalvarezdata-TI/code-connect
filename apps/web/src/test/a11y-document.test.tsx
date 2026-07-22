import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runA11y } from './a11y'

/**
 * Auditoria do shell do documento (`index.html`).
 *
 * As páginas são testadas via `render()`, que injeta o componente num `<div>` —
 * então `axe.run(container)` nunca alcança `<html>`/`<head>` e regras como
 * `html-has-lang` (WCAG 3.1.1), `document-title` (2.4.2) e `meta-viewport`
 * (1.4.4) saem como "inapplicable". Este arquivo carrega o `index.html` real no
 * jsdom para que essas regras de fato rodem.
 */

// `import.meta.url` não é uma URL `file:` sob jsdom; o root do vitest é apps/web.
const indexPath = resolve(process.cwd(), 'index.html')

beforeAll(() => {
  const source = readFileSync(indexPath, 'utf8')
  const parsed = new DOMParser().parseFromString(source, 'text/html')

  for (const { name, value } of Array.from(parsed.documentElement.attributes)) {
    document.documentElement.setAttribute(name, value)
  }
  document.head.innerHTML = parsed.head.innerHTML
  document.body.innerHTML = parsed.body.innerHTML
})

describe('acessibilidade WCAG 2.1 AA — index.html', () => {
  it('não tem violações no shell do documento', async () => {
    await expect(runA11y(document.documentElement)).resolves.toHaveNoA11yViolations()
  })

  it('declara o idioma real do conteúdo (WCAG 3.1.1)', () => {
    // A interface é escrita em português; `lang` precisa refletir isso, senão
    // leitores de tela aplicam fonemas do idioma errado. O axe só verifica que
    // `lang` existe e é válido — não que corresponde ao conteúdo.
    expect(document.documentElement.lang).toMatch(/^pt(-BR)?$/)
  })

  it('tem um título de página descritivo (WCAG 2.4.2)', () => {
    expect(document.title.trim().length).toBeGreaterThan(3)
  })
})
