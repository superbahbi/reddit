import { OrmEntityManagerContext } from "../types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";
@Resolver()
export class PostResolver {
  // Get all posts
  @Query(() => [Post])
  posts(@Ctx() { em }: OrmEntityManagerContext): Promise<Post[]> {
    return em.find(Post, {});
  }
  // Get post by ID
  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: OrmEntityManagerContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }
  // Create post
  @Mutation(() => Post)
  async createPost(
    @Arg("title", () => String) title: string,
    @Ctx() { em }: OrmEntityManagerContext
  ): Promise<Post | null> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }
  // Update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Number) id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: OrmEntityManagerContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }
  // Delete post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Number) id: number,
    @Ctx() { em }: OrmEntityManagerContext
  ): Promise<Boolean> {
    try {
      await em.nativeDelete(Post, { id });
    } catch {
      return false;
    }
    return true;
  }
}
