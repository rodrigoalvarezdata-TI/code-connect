import { Checkbox } from '@/components/atoms/Checkbox'
import { TextLink } from '@/components/atoms/TextLink'

interface RememberForgotProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  forgotHref?: string
}

export function RememberForgot({
  checked,
  onCheckedChange,
  forgotHref = '/forgot-password',
}: RememberForgotProps) {
  return (
    <div className="flex items-center justify-between">
      <Checkbox
        label="Lembrar-me"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <TextLink to={forgotHref} className="text-sm">
        Esqueci a senha
      </TextLink>
    </div>
  )
}
