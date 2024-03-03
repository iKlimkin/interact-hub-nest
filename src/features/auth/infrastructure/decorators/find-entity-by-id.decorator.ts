import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Client } from 'pg';

export const FindEntityById = (entityType: string) => createParamDecorator(
  async (id: string, ctx: ExecutionContext) => {
    const client = new Client();
    await client.connect();

    try {
      const result = await client.query(`SELECT * FROM ${entityType} WHERE id = $1`, [id]);

      if (result[0].id !== id) {
        throw new Error(`Entity with id ${id} not found`);
      }

    } finally {
      await client.end();
    }
  },
);