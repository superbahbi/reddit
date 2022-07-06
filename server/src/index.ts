require("dotenv").config({ path: `.env.development` });
import { OrmEntityManagerContext } from "./types";
import "reflect-metadata";
import { __prod__, __redis_uri__, COOKIE_NAME } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
console.log(path.join(__dirname, "./migrations/*"));
const main = async () => {
  const conn = new DataSource({
    type: "postgres",
    url: "postgresql://postgres:v33219@localhost:5432/reddit2",
    synchronize: false,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User],
    subscribers: [],
  });
  //a
  await conn
    .initialize()
    .then(async () => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });
  await conn
    .runMigrations()
    .then(() => {
      console.log("runMigrations has been initialized!");
    })
    .catch((err) => {
      console.error("Error during runMigrations initialization", err);
    });
  //test connection

  // await Post.delete({});
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(__redis_uri__ as string);
  // const redisClient = Redis.createClient({
  //   url: __redis_url__,
  //   password: __redis_pass__,
  //   legacyMode: true,
  // });
  // await redisClient.connect();

  app.use(
    cors({
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      secret: "jfklkajfakljfkalsdjfkej",
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): OrmEntityManagerContext => ({
      conn,
      req,
      res,
      redis,
    }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  app.listen(4000, () => {
    console.log("Server listening on port 4000");
  });
};
main().catch((err) => {
  console.error(err);
});
