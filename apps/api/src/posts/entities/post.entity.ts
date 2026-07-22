import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { PostLike } from './post-like.entity';

/**
 * Publicação do feed. Só campos de dados (mais relações) — a serialização para a
 * resposta HTTP passa sempre por um `*ResponseDto.fromEntity`, nunca pela entidade.
 *
 * A coluna `search_vector` (tsvector gerada) NÃO é mapeada aqui de propósito: o
 * TypeORM 1.1 não conhece o tipo `tsvector`. Ela é criada pela migration e as
 * queries a referenciam por SQL cru (`post.search_vector @@ ...`).
 */
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  /** O trecho de código exibido no bloco "Código:" da página de detalhe. */
  @Column({ type: 'text' })
  content: string;

  /**
   * URL da miniatura. Nullable de propósito: quando ausente, o frontend gera um
   * placeholder determinístico (não há imagem servida pelo backend).
   */
  @Column({
    type: 'varchar',
    length: 500,
    name: 'thumbnail_url',
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags: string[];

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  // Campos virtuais preenchidos por `loadRelationCountAndMap` no QueryBuilder.
  // Sem decorator: o TypeORM os ignora na persistência e apenas os popula na
  // leitura. Opcionais porque só existem quando a query os carrega.
  likesCount?: number;
  commentsCount?: number;
  /** Contagem 0/1 das curtidas do usuário atual; convertida em boolean no DTO. */
  likedByMe?: number;
}
