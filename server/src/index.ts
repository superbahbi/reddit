require("dotenv").config({ path: `.env.development` });
import { OrmEntityManagerContext } from "./types";
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__, __redis_url__, __redis_pass__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import * as redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    url: __redis_url__,
    password: __redis_pass__,
    legacyMode: true,
  });
  await redisClient.connect();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient as any,
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
      em: orm.em,
      req,
      res,
    }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
};
main().catch((err) => {
  console.error(err);
});