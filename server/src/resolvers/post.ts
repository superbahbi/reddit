import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  // Get all posts
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }
  // Get post by ID
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOneBy({ id });
  }
  // Create post
  @Mutation(() => Post)
  async createPost(
    @Arg("title", () => String) title: string
  ): Promise<Post | null> {
    return await Post.create({ title }).save();
  }
  // Update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Number) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }
  // Delete post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Number) id: number): Promise<Boolean> {
    try {
      await Post.delete({ id });
    } catch {
      return false;
    }
    return true;
  }
}
