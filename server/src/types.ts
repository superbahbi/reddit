import { Request, Response } from "express";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";

export type OrmEntityManagerContext = {
  conn: DataSource;
  req: Request;
  res: Response;
  redis: Redis;
};
