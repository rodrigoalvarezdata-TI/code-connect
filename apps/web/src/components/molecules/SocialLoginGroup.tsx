import { Divider } from '@/components/atoms/Divider'
import { SocialButton } from '@/components/atoms/SocialButton'

interface SocialLoginGroupProps {
  label?: string
  onGithub?: () => void
  onGoogle?: () => void
}

export function SocialLoginGroup({
  label = 'ou entre com outras contas',
  onGithub,
  onGoogle,
}: SocialLoginGroupProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Divider className="w-full">{label}</Divider>
      <div className="flex items-center gap-8">
        <SocialButton icon="/Github.png" label="Github" onClick={onGithub} />
        <SocialButton icon="/Google.png" label="Gmail" onClick={onGoogle} />
      </div>
    </div>
  )
}
