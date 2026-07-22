import type { SVGProps } from 'react'

/**
 * Ícones em SVG inline. O Figma usa a fonte Material Icons, mas trazê-la seria
 * uma dependência externa (contra a política self-contained do app) e um ponto a
 * mais de falha de carregamento. SVG inline usa `currentColor`, escala com o
 * texto e não depende de rede.
 *
 * Todos são decorativos por padrão (`aria-hidden`): sempre acompanham um rótulo
 * visível (o contador ao lado, ou o texto do item de menu). Para um ícone que
 * carregue significado sozinho, passe `aria-hidden={false}` e um `aria-label` no
 * elemento que o envolve.
 */
type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    width: '1em',
    height: '1em',
    'aria-hidden': true,
    focusable: false,
    ...props,
  } satisfies IconProps
}

/** "Aprovar"/curtir — no design é o glifo `code`. */
export function CodeIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        d="m8 8-4 4 4 4M16 8l4 4-4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        d="M18 8a2.5 2.5 0 1 0-2.45-3M8 12a2.5 2.5 0 1 0 0 .01M18 21a2.5 2.5 0 1 0-2.45-3M9.7 13.3l5.6 3.4M15.3 6.3 9.7 9.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        d="M4 5h16v11H8l-4 4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FeedIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        d="M4 5h16M4 12h16M4 19h10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={8} r={4} />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LoginIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M14 17l5-5-5-5M19 12H8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
