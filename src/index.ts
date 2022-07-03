import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolve } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolve],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
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
console.log("Hello World");
