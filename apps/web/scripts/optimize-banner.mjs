/**
 * Regenera as variantes do banner de autenticação a partir do master.
 *
 * O master vive em `assets-src/` de propósito: fora de `public/` (que é copiado
 * verbatim para o dist) e sem ser importado por nenhum módulo, então não entra
 * no bundle. Só as variantes geradas em `src/assets/` são enviadas.
 *
 * Uso: pnpm --filter web images:banner
 */
import { execFileSync } from 'node:child_process'
import { renameSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SOURCE = 'assets-src/banner-login.jpg'
const OUT_DIR = 'src/assets'
const BASENAME = 'banner-login'

/**
 * ~372px de largura renderizada (metade do AuthCard) → 1x e 2x.
 *
 * O JPG sai só em 400: ele é o `src` do <img>, usado apenas por browsers sem
 * AVIF nem WebP e por viewports <768px (onde o banner é `hidden`). Gerar o 2x
 * criaria um arquivo que nenhum import referencia — nem entraria no bundle.
 */
const FORMATS = [
  { ext: 'avif', quality: 55, widths: [400, 800] },
  { ext: 'webp', quality: 80, widths: [400, 800] },
  { ext: 'jpg', format: 'jpeg', quality: 80, widths: [400] },
]

const tmp = mkdtempSync(join(tmpdir(), 'banner-'))

try {
  for (const { ext, format, quality, widths } of FORMATS) {
    for (const width of widths) {
      execFileSync(
        'npx',
        [
          '--yes',
          'sharp-cli',
          '-i', SOURCE,
          '-o', tmp,
          '-f', format ?? ext,
          '-q', String(quality),
          'resize', String(width),
        ],
        { stdio: 'inherit', shell: true },
      )
      // sharp-cli preserva o nome do master; renomeamos para incluir a largura.
      const produced = join(tmp, `banner-login.${ext}`)
      const target = join(OUT_DIR, `${BASENAME}-${width}.${ext}`)
      renameSync(produced, target)
      console.log(`✓ ${target}`)
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
