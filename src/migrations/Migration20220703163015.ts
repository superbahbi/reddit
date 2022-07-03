import { Migration } from '@mikro-orm/migrations';

export class Migration20220703163015 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" add column "created_at" timestamptz(0) not null, add column "updated_at" timestamptz(0) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" drop column "created_at";');
    this.addSql('alter table "post" drop column "updated_at";');
  }

}
