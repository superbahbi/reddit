require("dotenv").config({ path: `.env.development` });
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import {
  __prod__,
  __db_type__,
  __db_name__,
  __db_user__,
  __db_pass__,
} from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  type: __db_type__,
  dbName: __db_name__,
  user: __db_user__,
  password: __db_pass__,
  debug: !__prod__,
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
