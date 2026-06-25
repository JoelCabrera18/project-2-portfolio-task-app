import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ResetWorkspaceDataUseCase } from '../classes/reset-workspace-data.class';

@Injectable()
export class ResetWorkspaceDataUseCaseImp implements ResetWorkspaceDataUseCase {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const schemas = ['workspaces', 'auth'];

      const tables: string[] = [];
      for (const schema of schemas) {
        const entities = this.dataSource.entityMetadatas
          .filter((m) => m.schema === schema)
          .map((m) => `"${m.schema}"."${m.tableName}"`);
        tables.push(...entities);
      }

      if (tables.length === 0) return;

      await queryRunner.query(`TRUNCATE ${tables.join(', ')} CASCADE`);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
