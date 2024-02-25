import { array } from 'joi';
import { likesStatus } from '../../../../../domain/likes.types';
import {
  PostReactionCounterType,
  PostsSqlDbType,
  UserReactionsOutType,
  UserReactionsType,
} from '../output.post.models/output.post.models';
import { PostViewModelType } from './post-view-model.type';

type PostReactionCounterOutType = {
  likesCount: number;
  dislikesCount: number;
};

const calculateLikesDislikesCount = (
  reactionCounters: PostReactionCounterType[],
  postId: string,
): PostReactionCounterOutType => {
  console.log({ reactionCounters });

  const likesCount = +reactionCounters
    .map((counter) => (counter.post_id === postId ? counter.likes_count : 0))
    .filter(Number);

  const dislikesCount = +reactionCounters
    .map((element) => (element.post_id === postId ? element.dislikes_count : 0))
    .filter(Number);

  return {
    likesCount: likesCount || 0,
    dislikesCount: dislikesCount || 0,
  };
};

const convertStatus = (
  myReactions: UserReactionsOutType[] | likesStatus,
  rawPost: PostsSqlDbType,
): likesStatus => {
  let result: likesStatus;
  if (Array.isArray(myReactions)) {
    result = myReactions
      .map((r) =>
        r.post_id === rawPost.id ? r.reaction_type : likesStatus.None,
      )
      .join('') as likesStatus;
  } else {
    result = myReactions as likesStatus;
  }

  return result;
};

export const getPostSqlViewModel = (
  rawPost: PostsSqlDbType,
  userReactions: UserReactionsType[],
  reactionCounter: PostReactionCounterType[],
  myReactions: UserReactionsOutType[] | likesStatus = [],
): PostViewModelType => {
  const { likesCount, dislikesCount } = calculateLikesDislikesCount(
    reactionCounter,
    rawPost.id,
  );

  return {
    id: rawPost.id,
    title: rawPost.title,
    shortDescription: rawPost.short_description,
    content: rawPost.content,
    blogId: rawPost.blog_id,
    blogName: rawPost.blog_title,
    createdAt: rawPost.created_at.toISOString(),
    extendedLikesInfo: {
      likesCount,
      dislikesCount,
      myStatus: convertStatus(myReactions, rawPost) || likesStatus.None,
      newestLikes: userReactions.map((like) => ({
        addedAt: like.liked_at,
        userId: like.user_id,
        login: like.user_login,
      })),
    },
  };
};
