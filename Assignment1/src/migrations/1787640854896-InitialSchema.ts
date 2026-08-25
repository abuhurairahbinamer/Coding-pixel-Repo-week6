import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787640854896 implements MigrationInterface {
    name = 'InitialSchema1787640854896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_members" DROP CONSTRAINT "project_members_role_check"`);
        await queryRunner.query(`ALTER TABLE "project_members" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."project_members_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer')`);
        await queryRunner.query(`ALTER TABLE "project_members" ADD "role" "public"."project_members_role_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "project_members" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."project_members_role_enum"`);
        await queryRunner.query(`ALTER TABLE "project_members" ADD "role" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "project_members" ADD CONSTRAINT "project_members_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'viewer'::text])))`);
    }

}
