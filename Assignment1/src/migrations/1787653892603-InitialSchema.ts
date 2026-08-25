import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787653892603 implements MigrationInterface {
    name = 'InitialSchema1787653892603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."project_members_role_enum" RENAME TO "project_members_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."project_members_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer')`);
        await queryRunner.query(`ALTER TABLE "project_members" ALTER COLUMN "role" TYPE "public"."project_members_role_enum" USING "role"::"text"::"public"."project_members_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."project_members_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "tasks_status_check"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('todo', 'in_progress', 'done')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "status" "public"."tasks_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "tasks_status_check" CHECK ("status" IN ('todo', 'in_progress', 'done'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "tasks_status_check"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "status" text`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "tasks_status_check" CHECK ((status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'done'::text])))`);
        await queryRunner.query(`CREATE TYPE "public"."project_members_role_enum_old" AS ENUM('owner', 'admin', 'member', 'viewer')`);
        await queryRunner.query(`ALTER TABLE "project_members" ALTER COLUMN "role" TYPE "public"."project_members_role_enum_old" USING "role"::"text"::"public"."project_members_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."project_members_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."project_members_role_enum_old" RENAME TO "project_members_role_enum"`);
    }

}
