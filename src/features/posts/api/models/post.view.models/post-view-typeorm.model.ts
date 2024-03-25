import {
  likesStatus,
  ReactionsCounter,
} from '../../../../../domain/likes.types';
import { PostReactionCounts } from '../../../domain/entities/post-reaction-counts.entity';
import { PostReaction } from '../../../domain/entities/post-reactions.entity';
import { Post } from '../../../domain/entities/post.entity';
import {
  PostReactionCounter,
  PostsSqlDbType,
  UserPostReactionsType,
  UserReactionsOutType,
} from '../output.post.models/output.post.models';
import { PostViewModelType } from './post-view-model.type';

const calculateLikesDislikesCount = (
  reactionCounters: PostReactionCounter[] | Post[],
  postId: string,
): ReactionsCounter => {
  const likesCount = +reactionCounters
    .map((counter) => (counter.post_id === postId ? counter.likes_count : 0))
    .filter(Number);

  const dislikesCount = +reactionCounters
    .map((counter) => (counter.post_id === postId ? counter.dislikes_count : 0))
    .filter(Number);

  return {
    likesCount: likesCount || 0,
    dislikesCount: dislikesCount || 0,
  };
};

const convertStatus = (
  myReactions: UserReactionsOutType[] | likesStatus,
  rawPost: PostsSqlDbType | Post,
): likesStatus => {
  let result: likesStatus;

  if (Array.isArray(myReactions)) {
    if (!myReactions.length) return likesStatus.None;
    result =
      (myReactions
        .filter((r) => r.post_id === rawPost.id)
        .map((r) =>
          r.post_id === rawPost.id ? r.reaction_type : likesStatus.None,
        )
        .join('') as likesStatus) || likesStatus.None;
  } else {
    result = (myReactions as likesStatus) || likesStatus.None;
  }

  return result;
};

export const getPostTORViewModel = (
  post: Post,
  latestReactions: PostReaction[],
  myReaction: likesStatus,
): PostViewModelType => {
  // const { likesCount, dislikesCount } = calculateLikesDislikesCount(
  //   reactionCounter,
  //   post.id,
  // );

  return {
    id: post.id,
    title: post.title,
    shortDescription: post.short_description,
    content: post.content,
    blogId: post.blog.id,
    blogName: post.blog_title,
    createdAt: post.created_at.toISOString(),
    extendedLikesInfo: {
      likesCount: post.postReactionCounts?.likes_count || 0,
      dislikesCount: post.postReactionCounts?.dislikes_count || 0,
      myStatus: myReaction,
      newestLikes: latestReactions.length
        ? latestReactions.map((like) => ({
            addedAt: like.created_at.toISOString(),
            userId: like.user.id,
            login: like.user_login,
          }))
        : [],
    },
  };
};
