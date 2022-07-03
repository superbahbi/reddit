import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type OrmEntityManagerContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
};
