import banner400Avif from '@/assets/banner-login-400.avif'
import banner800Avif from '@/assets/banner-login-800.avif'
import banner400Webp from '@/assets/banner-login-400.webp'
import banner800Webp from '@/assets/banner-login-800.webp'
import banner400Jpg from '@/assets/banner-login-400.jpg'

interface BannerImageProps {
  alt: string
  className?: string
}

/**
 * Banner das telas de autenticação, em formatos modernos.
 *
 * Notas de implementação (cada uma existe por um motivo — não simplificar sem ler):
 *
 * - `className="contents"` no `<picture>`: por padrão `picture` é `display:inline`
 *   e viraria o containing block do `<img>`. Sem altura definida, o `h-full`
 *   resolveria para `auto` e o banner deixaria de preencher a coluna.
 *   `display:contents` mantém o `<div>` pai como containing block. É neutro para
 *   acessibilidade — `picture` não tem role implícito.
 *
 * - Descritores `1x`/`2x` em vez de `400w`/`800w`: a largura renderizada é fixa
 *   (~372px, metade do AuthCard). Com descritores `w` e sem `sizes`, o default é
 *   `100vw` e um desktop DPR1 baixaria o 800 para uma caixa de 372px.
 *
 * - O `<img>` só tem `src` (sem `srcSet`): abaixo de 768px nenhum `<source>`
 *   casa e o browser cai no `src`, que é incondicional. Apontar para o menor JPG
 *   limita o desperdício a ~26KB no mobile (onde o banner é `hidden`). Com
 *   `srcSet` no `<img>`, celulares DPR2+ baixariam a variante de 73KB.
 *   O caminho JPG só é usado por browsers sem AVIF nem WebP.
 *
 * - `width`/`height` codificam o aspect ratio (todas as variantes compartilham
 *   o mesmo), não o tamanho de exibição.
 */
export function BannerImage({ alt, className = '' }: BannerImageProps) {
  return (
    <picture className="contents">
      <source
        type="image/avif"
        media="(min-width: 768px)"
        srcSet={`${banner400Avif} 1x, ${banner800Avif} 2x`}
      />
      <source
        type="image/webp"
        media="(min-width: 768px)"
        srcSet={`${banner400Webp} 1x, ${banner800Webp} 2x`}
      />
      <img
        src={banner400Jpg}
        alt={alt}
        width={800}
        height={1327}
        fetchPriority="high"
        className={`h-full w-full rounded-xl object-cover ${className}`}
      />
    </picture>
  )
}
