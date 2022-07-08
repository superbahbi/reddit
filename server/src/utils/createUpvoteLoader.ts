import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      const upvotes = await Upvote.findByIds(keys as any);
      const upvoteIdToUpvote: Record<string, Upvote | null> = {};
      upvotes.forEach((upvote) => {
        upvoteIdToUpvote[`${upvote.postId}|${upvote.userId}`] = upvote;
      });
      return keys.map((key) => upvoteIdToUpvote[`${key.postId}|${key.userId}`]);
    }
  );
