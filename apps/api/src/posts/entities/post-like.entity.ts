import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';

/**
 * Curtida ("Aprovar") de um usuário em um post. A unicidade é do banco:
 * `UNIQUE(post_id, user_id)` garante uma curtida por usuário/post mesmo com
 * várias instâncias da API — o service traduz o 23505 em vez de checar antes.
 *
 * O `@Unique` aqui é documental (o schema real vem da migration; `synchronize`
 * está off), mas deixa a intenção explícita junto da entidade.
 */
@Entity('post_likes')
@Unique(['postId', 'userId'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ type: 'uuid', name: 'post_id' })
  postId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
