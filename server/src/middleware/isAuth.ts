import { OrmEntityManagerContext } from "./../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<OrmEntityManagerContext> = (
  { context },
  next
) => {
  //@ts-ignore
  if (!context.req.session.userId) {
    throw new Error("not authenticated");
  }
  return next();
};
