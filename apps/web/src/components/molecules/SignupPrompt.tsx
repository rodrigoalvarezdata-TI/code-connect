import { TextLink } from '@/components/atoms/TextLink'

interface SignupPromptProps {
  message: string
  linkText: string
  to: string
}

export function SignupPrompt({ message, linkText, to }: SignupPromptProps) {
  return (
    <div className="text-center text-sm">
      <p className="text-content-muted">{message}</p>
      <TextLink to={to} className="font-semibold">
        {linkText}
      </TextLink>
    </div>
  )
}
