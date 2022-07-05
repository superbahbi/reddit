import { Field, InputType } from "type-graphql";
import { OptionalProps } from "@mikro-orm/core";

@InputType()
export class UsernamePasswordInput {
  [OptionalProps]?: "password";
  @Field()
  email: string;
  @Field(() => String)
  username: string;
  @Field(() => String)
  password: string;
}
