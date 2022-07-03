import { Migration } from '@mikro-orm/migrations';

export class Migration20220703162935 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "title" varchar(255) not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;');
  }

}
