import { validateRegister } from "./../utils/validateRegister";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "./../constants";
import { OrmEntityManagerContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}
@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, em, req }: OrmEntityManagerContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password must be at least 3 characters",
          },
        ],
      };
    }
    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return { errors: [{ field: "token", message: "token expired" }] };
    }
    const user = await em.findOne(User, { id: parseInt(userId) });
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }
    user.password = await argon2.hash(newPassword);
    em.persistAndFlush(user);

    await redis.del(key);

    //@ts-ignore
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: OrmEntityManagerContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) {
      return true;
    }
    // const token = (await user.generatePasswordResetToken()) as string;
    const token = v4();
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24
    );
    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Change Password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: OrmEntityManagerContext) {
    //@ts-ignore
    const userId = req.session.userId;

    // You are not logged in
    if (!userId) {
      return null;
    }
    const user = await em.findOne(User, { id: userId });
    return user;
  }
  // Register a new user
  // @params username: string, password: string
  // @params username: string, password: string
  // @returns User
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: OrmEntityManagerContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          email: options.email,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
    } catch (err) {
      // dupe username error
      //err.detail.includes("already exists")
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }
    //@ts-ignore
    req.session.userId = user.id;
    return { user };
  }
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: OrmEntityManagerContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username not found",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }
    //@ts-ignore
    req.session.userId = user.id;
    return { user };
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: OrmEntityManagerContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
