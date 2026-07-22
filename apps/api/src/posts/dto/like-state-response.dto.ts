import { ApiProperty } from '@nestjs/swagger';

/** Estado da curtida após curtir/descurtir — deixa o frontend refletir a verdade. */
export class LikeStateResponseDto {
  @ApiProperty({ example: 13 })
  likesCount: number;

  @ApiProperty({ example: true })
  likedByMe: boolean;
}
