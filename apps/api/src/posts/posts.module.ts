import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike, Comment])],
  controllers: [PostsController],
  // OptionalAuthGuard é usado via @UseGuards nas rotas de leitura; como é
  // injetável (depende de JwtService, global pelo AuthModule), registrá-lo aqui
  // basta para o Nest resolvê-lo.
  providers: [PostsService, OptionalAuthGuard],
})
export class PostsModule {}
