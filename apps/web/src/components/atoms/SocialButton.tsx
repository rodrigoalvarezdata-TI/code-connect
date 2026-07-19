interface SocialButtonProps {
  icon: string
  label: string
  onClick?: () => void
}

export function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-xs text-content-muted transition-transform hover:scale-110 focus:outline-none focus-visible:text-content"
    >
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="h-7 w-7 object-contain"
      />
      {label}
    </button>
  )
}
