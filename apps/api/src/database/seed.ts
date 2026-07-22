import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Comment } from '../posts/entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { SALT_ROUNDS } from '../users/users.constants';
import { User } from '../users/entities/user.entity';
import { buildDataSourceOptions } from './data-source.options';
import { loadRootEnv } from './load-root-env';

/**
 * Popula o banco com dados mockados para desenvolver/apresentar o feed.
 *
 * Roda fora do Nest (como o `data-source.ts`), então carrega o `.env` da raiz à
 * mão. É idempotente: recria as publicações a cada execução (`TRUNCATE posts
 * CASCADE` limpa curtidas e comentários juntos) e faz upsert dos usuários por
 * e-mail — assim dá para rodar quantas vezes quiser sem duplicar.
 *
 * Uso: `pnpm api:seed` (a partir da raiz) ou `pnpm seed` (dentro de apps/api).
 */
const SEED_PASSWORD = 'Senha@123';

interface SeedUser {
  name: string;
  email: string;
}

const SEED_USERS: SeedUser[] = [
  { name: 'Julio Silva', email: 'julio@codeconnect.dev' },
  { name: 'Marcia Alves', email: 'marcia@codeconnect.dev' },
  { name: 'Gabriel Luz', email: 'gabriel@codeconnect.dev' },
  { name: 'Marcela Lins', email: 'marcela@codeconnect.dev' },
];

interface SeedPost {
  authorEmail: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  thumbnailUrl: string | null;
}

// Alguns posts ficam com thumbnailUrl null de propósito, para exercitar o
// placeholder gerado no frontend.
const SEED_POSTS: SeedPost[] = [
  {
    authorEmail: 'julio@codeconnect.dev',
    title: 'Criando hooks reutilizáveis no React',
    description:
      'Como extrair lógica repetida de componentes para custom hooks limpos e testáveis.',
    content: `function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  return [on, toggle]
}`,
    tags: ['React', 'Hooks', 'Front-end'],
    thumbnailUrl: 'https://picsum.photos/seed/react-hooks/960/540',
  },
  {
    authorEmail: 'julio@codeconnect.dev',
    title: 'Composição de funções em JavaScript',
    description:
      'Um utilitário pequeno de compose para encadear transformações de dados.',
    content: `const compose = (...fns) => (x) =>
  fns.reduceRight((acc, fn) => fn(acc), x)

const slugify = compose(
  (s) => s.replace(/\\s+/g, '-'),
  (s) => s.toLowerCase(),
  (s) => s.trim(),
)`,
    tags: ['JavaScript', 'Funcional'],
    thumbnailUrl: null,
  },
  {
    authorEmail: 'marcia@codeconnect.dev',
    title: 'Acessibilidade: foco visível de verdade',
    description:
      'Trocando outline: none por um anel de foco que respeita o contraste mínimo.',
    content: `.botao:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--brand-500);
}`,
    tags: ['Acessibilidade', 'CSS', 'Front-end'],
    thumbnailUrl: null,
  },
  {
    authorEmail: 'gabriel@codeconnect.dev',
    title: 'Debounce sem biblioteca',
    description: 'Uma função debounce em poucas linhas para inputs de busca.',
    content: `function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}`,
    tags: ['JavaScript', 'Performance'],
    thumbnailUrl: 'https://picsum.photos/seed/debounce/960/540',
  },
  {
    authorEmail: 'julio@codeconnect.dev',
    title: 'Guarda de rota no React Router',
    description:
      'Protegendo rotas com um componente de layout que renderiza um Outlet.',
    content: `function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}`,
    tags: ['React', 'React Router'],
    thumbnailUrl: null,
  },
  {
    authorEmail: 'marcela@codeconnect.dev',
    title: 'Full-text search no Postgres',
    description:
      'Coluna tsvector gerada + índice GIN para busca textual rápida.',
    content: `ALTER TABLE posts ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese', title || ' ' || description)
  ) STORED;

CREATE INDEX idx_search ON posts USING GIN (search_vector);`,
    tags: ['Postgres', 'SQL', 'Back-end'],
    thumbnailUrl: 'https://picsum.photos/seed/postgres-fts/960/540',
  },
  {
    authorEmail: 'gabriel@codeconnect.dev',
    title: 'Injeção de dependência no NestJS',
    description:
      'Por que providers são singletons e como isso simplifica os testes.',
    content: `@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
  ) {}
}`,
    tags: ['NestJS', 'Back-end', 'TypeScript'],
    thumbnailUrl: null,
  },
  {
    authorEmail: 'marcia@codeconnect.dev',
    title: 'Grid responsivo com Tailwind',
    description:
      'Cards que reflowam de 1 a 2 colunas sem media queries manuais.',
    content: `<ul className="grid gap-6 sm:grid-cols-2">
  {posts.map((post) => (
    <PostCard key={post.id} post={post} />
  ))}
</ul>`,
    tags: ['Tailwind', 'CSS', 'Front-end'],
    thumbnailUrl: null,
  },
  {
    authorEmail: 'julio@codeconnect.dev',
    title: 'Tratando erros de unicidade sem race condition',
    description:
      'Deixe a constraint UNIQUE decidir e traduza o erro 23505 do Postgres.',
    content: `try {
  await repo.insert({ postId, userId })
} catch (e) {
  if (e.driverError?.code === '23505') return // já existe
  throw e
}`,
    tags: ['Postgres', 'Back-end', 'TypeScript'],
    thumbnailUrl: 'https://picsum.photos/seed/unique-violation/960/540',
  },
];

async function seed(): Promise<void> {
  loadRootEnv();
  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();

  try {
    const usersRepo = dataSource.getRepository(User);
    const postsRepo = dataSource.getRepository(Post);
    const commentsRepo = dataSource.getRepository(Comment);
    const likesRepo = dataSource.getRepository(PostLike);

    // Recria só o conteúdo do feed; usuários são preservados (upsert por e-mail).
    await dataSource.query(
      'TRUNCATE TABLE "posts", "post_likes", "comments" RESTART IDENTITY CASCADE',
    );

    const passwordHash = await hash(SEED_PASSWORD, SALT_ROUNDS);
    const usersByEmail = new Map<string, User>();
    for (const seedUser of SEED_USERS) {
      const email = seedUser.email.toLowerCase();
      let user = await usersRepo.findOne({ where: { email } });
      if (!user) {
        user = await usersRepo.save(
          usersRepo.create({ name: seedUser.name, email, passwordHash }),
        );
      }
      usersByEmail.set(email, user);
    }

    // createdAt decrescente para o feed ("Recentes") ficar com ordem estável.
    const now = Date.now();
    const savedPosts: Post[] = [];
    for (let i = 0; i < SEED_POSTS.length; i++) {
      const seedPost = SEED_POSTS[i];
      const author = usersByEmail.get(seedPost.authorEmail.toLowerCase())!;
      const post = await postsRepo.save(
        postsRepo.create({
          title: seedPost.title,
          description: seedPost.description,
          content: seedPost.content,
          tags: seedPost.tags,
          thumbnailUrl: seedPost.thumbnailUrl,
          authorId: author.id,
          createdAt: new Date(now - i * 3_600_000), // 1h de intervalo
        }),
      );
      savedPosts.push(post);
    }

    // Comentários + respostas (1 nível) no primeiro post, espelhando o design.
    const firstPost = savedPosts[0];
    const marcia = usersByEmail.get('marcia@codeconnect.dev')!;
    const gabriel = usersByEmail.get('gabriel@codeconnect.dev')!;
    const marcela = usersByEmail.get('marcela@codeconnect.dev')!;
    const julio = usersByEmail.get('julio@codeconnect.dev')!;

    await commentsRepo.save(
      commentsRepo.create({
        postId: firstPost.id,
        authorId: marcia.id,
        body: 'Achei muito bom seu código, @julio, parabéns!',
      }),
    );
    const question = await commentsRepo.save(
      commentsRepo.create({
        postId: firstPost.id,
        authorId: gabriel.id,
        body: 'Quanto tempo você levou para finalizar esse projeto?',
      }),
    );
    await commentsRepo.save(
      commentsRepo.create({
        postId: firstPost.id,
        authorId: julio.id,
        parentId: question.id,
        body: 'Até que foi rápido, uns 3 dias!',
      }),
    );
    await commentsRepo.save(
      commentsRepo.create({
        postId: firstPost.id,
        authorId: marcela.id,
        body: 'Espero chegar um dia nesse nível! Muito bom!',
      }),
    );

    // Curtidas distribuídas — alguns posts mais curtidos que outros.
    const likers = [marcia, gabriel, marcela, julio];
    for (let i = 0; i < savedPosts.length; i++) {
      const howMany = ((i * 3) % likers.length) + 1;
      for (let j = 0; j < howMany; j++) {
        await likesRepo.save(
          likesRepo.create({
            postId: savedPosts[i].id,
            userId: likers[j].id,
          }),
        );
      }
    }

    console.log(
      `Seed concluído: ${SEED_USERS.length} usuários, ${savedPosts.length} posts.`,
    );
    console.log(
      `Logins de teste: ${SEED_USERS.map((u) => u.email).join(', ')} — senha "${SEED_PASSWORD}".`,
    );
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Falha no seed:', error);
  process.exit(1);
});
