import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenantIdAsFK1762703330909 implements MigrationInterface {
    name = 'AddTenantIdAsFK1762703330909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tenantId" integer`)
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "FK_ea17f1170336ea3bc1f5100adbb" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP CONSTRAINT "FK_ea17f1170336ea3bc1f5100adbb"`,
        )
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenantId"`)
    }
}
