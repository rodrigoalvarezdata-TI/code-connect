import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { runA11y } from './a11y'
import { renderWithProviders } from './utils'

import { LoginPage } from '@/components/pages/LoginPage'
import { RegisterPage } from '@/components/pages/RegisterPage'
import { DashboardPage } from '@/components/pages/DashboardPage'
import { LoginForm } from '@/components/organisms/LoginForm'
import { RegisterForm } from '@/components/organisms/RegisterForm'
import { AuthCard } from '@/components/organisms/AuthCard'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { FormField } from '@/components/molecules/FormField'
import { RememberForgot } from '@/components/molecules/RememberForgot'
import { SignupPrompt } from '@/components/molecules/SignupPrompt'
import { SocialLoginGroup } from '@/components/molecules/SocialLoginGroup'
import { Alert } from '@/components/atoms/Alert'
import { BannerImage } from '@/components/atoms/BannerImage'
import { BrandMark } from '@/components/atoms/BrandMark'
import { Button } from '@/components/atoms/Button'
import { Checkbox } from '@/components/atoms/Checkbox'
import { Divider } from '@/components/atoms/Divider'
import { Input } from '@/components/atoms/Input'
import { Label } from '@/components/atoms/Label'
import { SocialButton } from '@/components/atoms/SocialButton'
import { TextLink } from '@/components/atoms/TextLink'
import { Avatar } from '@/components/atoms/Avatar'
import { Tag } from '@/components/atoms/Tag'
import { Thumbnail } from '@/components/atoms/Thumbnail'
import { AuthorTag } from '@/components/molecules/AuthorTag'
import { CommentComposer } from '@/components/molecules/CommentComposer'
import { CommentItem } from '@/components/molecules/CommentItem'
import { PostCard } from '@/components/molecules/PostCard'
import { PostStats } from '@/components/molecules/PostStats'
import { SearchBar } from '@/components/molecules/SearchBar'
import { CommentSection } from '@/components/organisms/CommentSection'
import { CreatePostForm } from '@/components/organisms/CreatePostForm'
import { PostDetailCard } from '@/components/organisms/PostDetailCard'
import { PostList } from '@/components/organisms/PostList'
import { SearchHeader } from '@/components/organisms/SearchHeader'
import { MobileNav, Sidebar } from '@/components/organisms/Sidebar'
import { AppLayout } from '@/components/templates/AppLayout'
import { makePostDetail, makePostSummary } from '@/test/post-fixtures'

const sampleComment = {
  id: 'c1',
  body: 'Comentário de exemplo',
  author: { id: 'u1', name: 'Marcia Alves' },
  createdAt: '2026-07-22T10:00:00.000Z',
  replies: [],
}
const noop = () => {}
const asyncNoop = async () => {}

/**
 * Auditoria automatizada de acessibilidade (WCAG 2.1 nível AA) via axe-core.
 *
 * Cobre a árvore inteira nas páginas e, isoladamente, cada tier do atomic design
 * — um componente pode ser acessível dentro da página e falhar sozinho (ou o
 * contrário, quando depende de um label externo).
 *
 * Limite conhecido: jsdom não faz layout nem renderiza canvas, então a regra
 * `color-contrast` sai sempre como "incomplete" e nunca é checada aqui.
 * Contraste (1.4.3), foco visível (2.4.7) e reflow (1.4.10) exigem navegador
 * real — os ratios dos tokens estão tabelados no CLAUDE.md.
 */

/** Factory em vez de elemento pronto: mantém a renderização lazy por caso. */
type Case = [name: string, render: () => ReactElement]

const pages: Case[] = [
  ['LoginPage', () => <LoginPage />],
  ['RegisterPage', () => <RegisterPage />],
  ['DashboardPage', () => <DashboardPage />],
]

const organisms: Case[] = [
  ['LoginForm', () => <LoginForm />],
  ['LoginForm (com erro da API)', () => <LoginForm errorMessage="E-mail ou senha inválidos." />],
  ['RegisterForm', () => <RegisterForm />],
  ['RegisterForm (com erro da API)', () => <RegisterForm errorMessage="E-mail já cadastrado" />],
  [
    'AuthCard',
    () => (
      <AuthCard bannerAlt="Banner ilustrativo">
        <p>conteúdo</p>
      </AuthCard>
    ),
  ],
  [
    'AuthLayout',
    () => (
      <AuthLayout>
        <p>conteúdo</p>
      </AuthLayout>
    ),
  ],
  ['AppLayout', () => <AppLayout />],
  ['Sidebar', () => <Sidebar />],
  ['MobileNav', () => <MobileNav />],
  ['SearchHeader', () => <SearchHeader search="react" onSearch={noop} />],
  [
    'PostList',
    () => <PostList posts={[makePostSummary()]} isLoading={false} />,
  ],
  ['PostList (vazio)', () => <PostList posts={[]} isLoading={false} />],
  [
    'PostDetailCard',
    () => <PostDetailCard post={makePostDetail()} onToggleLike={noop} />,
  ],
  [
    'CommentSection (logado)',
    () => (
      <CommentSection
        comments={[sampleComment]}
        isAuthenticated
        onAddComment={asyncNoop}
        onReply={asyncNoop}
      />
    ),
  ],
  [
    'CommentSection (visitante)',
    () => (
      <CommentSection
        comments={[sampleComment]}
        isAuthenticated={false}
        onAddComment={asyncNoop}
        onReply={asyncNoop}
      />
    ),
  ],
  ['CreatePostForm', () => <CreatePostForm onSubmit={noop} />],
]

const molecules: Case[] = [
  ['FormField', () => <FormField id="email" label="Email" type="email" />],
  [
    'FormField (com erro)',
    () => <FormField id="email" label="Email" type="email" error="Email inválido" />,
  ],
  ['RememberForgot', () => <RememberForgot checked={false} onCheckedChange={() => {}} />],
  [
    'SignupPrompt',
    () => (
      <SignupPrompt message="Ainda não tem conta?" linkText="Cadastre-se" to="/register" />
    ),
  ],
  ['SocialLoginGroup', () => <SocialLoginGroup />],
  ['PostStats', () => <PostStats likesCount={12} commentsCount={3} likedByMe={false} />],
  [
    'PostStats (interativo)',
    () => (
      <PostStats
        likesCount={12}
        commentsCount={3}
        likedByMe
        onToggleLike={noop}
      />
    ),
  ],
  ['AuthorTag', () => <AuthorTag name="Julio Silva" />],
  ['SearchBar', () => <SearchBar onSearch={noop} />],
  ['CommentComposer', () => <CommentComposer label="Comentar" onSubmit={asyncNoop} />],
  ['CommentItem', () => <CommentItem comment={sampleComment} canReply={false} />],
  ['PostCard', () => <PostCard post={makePostSummary()} />],
]

const atoms: Case[] = [
  ['Alert', () => <Alert>E-mail ou senha inválidos.</Alert>],
  ['BannerImage', () => <BannerImage alt="Banner ilustrativo" />],
  ['BrandMark (decorativo)', () => <BrandMark />],
  ['BrandMark (com título)', () => <BrandMark title="code connect" />],
  ['Button', () => <Button>Entrar</Button>],
  ['Button (desabilitado)', () => <Button disabled>Entrar</Button>],
  ['Checkbox', () => <Checkbox label="Lembrar-me" />],
  ['Divider', () => <Divider />],
  ['Divider (com texto)', () => <Divider>ou entre com outras contas</Divider>],
  [
    'Input (rotulado)',
    () => (
      <>
        <Label htmlFor="a11y-input">Email</Label>
        <Input id="a11y-input" type="email" />
      </>
    ),
  ],
  ['SocialButton', () => <SocialButton icon="/Github.png" label="Github" />],
  ['TextLink', () => <TextLink to="/login">Faça seu login</TextLink>],
  ['Avatar', () => <Avatar name="Julio Silva" className="size-8" />],
  ['Tag', () => <Tag>React</Tag>],
  ['Tag (removível)', () => <Tag onRemove={noop}>React</Tag>],
  [
    'Thumbnail (placeholder)',
    () => (
      <Thumbnail src={null} alt="Post de exemplo" seed="p1" className="aspect-video w-40" />
    ),
  ],
]

describe.each([
  ['páginas', pages],
  ['organismos', organisms],
  ['moléculas', molecules],
  ['átomos', atoms],
])('acessibilidade WCAG 2.1 AA — %s', (_tier, cases) => {
  it.each(cases)('%s não tem violações', async (_name, renderCase) => {
    // renderWithProviders (e não renderWithRouter): as páginas agora leem a
    // sessão via useAuth(), que lança fora do AuthProvider.
    const { container } = renderWithProviders(renderCase())
    await expect(runA11y(container)).resolves.toHaveNoA11yViolations()
  })
})
