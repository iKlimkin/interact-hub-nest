import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserViewModel } from '../../../src/features/admin/api/models/userAdmin.view.models/userAdmin.view.model';
import { CommentsViewModel } from '../../../src/features/comments/api/models/comments.view.models/comments.view.model';
import { PostViewModel } from '../../../src/features/posts/api/models/post.view.models/PostViewModel';
import { likesStatus } from '../../../src/infra/likes.types';
import { RouterPaths } from '../utils/routing';

export class FeedbacksTestManager {
  constructor(protected readonly app: INestApplication) {}
  private application = this.app.getHttpServer();

  async createComment(
    inputData: {
      user: UserViewModel;
      token: string;
      post: PostViewModel;
    },
    content: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<{ comment: CommentsViewModel }> {
    const response = await request(this.application)
      .post(`${RouterPaths.posts}/${inputData.post.id}/comments`)
      .auth(inputData.token, { type: 'bearer' })
      .send({ content })
      .expect(expectedStatus);

    expect(response.body).toEqual({
      id: expect.any(String),
      content: content,
      commentatorInfo: {
        userId: inputData.user.id,
        userLogin: inputData.user.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likesStatus.None,
      },
    } as CommentsViewModel);

    const comment = response.body;

    return { comment };
  }

  async updateComment(
    inputData: {
      commentId: string;
      token: string;
      content?: string;
    },
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.application)
      .put(`${RouterPaths.comments}/${inputData.commentId}`)
      .auth(inputData.token, { type: 'bearer' })
      .send(
        inputData.content || {
          content: 'content include discussion about neurobiology',
        },
      )
      .expect(expectedStatus);
  }

  async deleteComment(
    commentId: number,
    token: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.application)
      .delete(`${RouterPaths.comments}/${commentId}`)
      .auth(token, { type: 'bearer' })
      .expect(expectedStatus);
  }
}
