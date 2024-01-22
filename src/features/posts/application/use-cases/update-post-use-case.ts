import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../../infra/validators/validate-model.helper';
import { UpdatePostModel } from '../../api/models/input.posts.models/create.post.model';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(public updatePostDto: UpdatePostModel) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    await validateOrRejectModel(command, UpdatePostCommand);

    return this.postsRepository.updatePost(
      command.updatePostDto.postId,
      command.updatePostDto.inputPostDto,
    );
  }
}
