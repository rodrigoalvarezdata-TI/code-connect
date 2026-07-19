interface BrandMarkProps {
  className?: string
  /** Quando informado, o mark vira uma imagem acessível; caso contrário é decorativo. */
  title?: string
}

/** Marca "code connect" (dois elos de corrente entrelaçados). Usa currentColor. */
export function BrandMark({ className = '', title }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <rect
        x="4"
        y="6"
        width="34"
        height="28"
        rx="11"
        stroke="currentColor"
        strokeWidth="5"
      />
      <rect
        x="26"
        y="6"
        width="34"
        height="28"
        rx="11"
        stroke="currentColor"
        strokeWidth="5"
      />
    </svg>
  )
}
