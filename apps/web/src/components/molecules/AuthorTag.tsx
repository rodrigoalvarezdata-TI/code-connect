import { Avatar } from '@/components/atoms/Avatar'
import { handleFromName } from '@/lib/handle'

interface AuthorTagProps {
  name: string
  className?: string
}

/** Avatar + handle do autor, como no rodapé do card. */
export function AuthorTag({ name, className = '' }: AuthorTagProps) {
  return (
    <span className={`flex items-center gap-2 text-content-muted ${className}`}>
      <Avatar name={name} className="size-8" />
      <span className="text-sm font-semibold">{handleFromName(name)}</span>
    </span>
  )
}
