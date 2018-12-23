import { Container } from 'typedi';
import { Pgsql } from '@/service/storage/pgsql';

const pgsql = Container.get<Pgsql>(Pgsql);

type ItemPayload = {
  id: string;
} & UpdatePayload;

type UpdatePayload = {
  name: string;
  description: string;
  complete: boolean;
};

export default {
  Query: {
    items: async () => {
      let res;
      const client = await pgsql.connect();
      if (client) {
        try {
          res = await client.query(`
            SELECT * FROM items
          `);
        } finally {
          client.release();
        }
      }
      return res && res.rows;
    },
  },
  Mutation: {
    // FIXME: @see https://github.com/apollographql/graphql-tools/issues/704
    // I don't know why I should add any at second param QQ
    async addItem(_: any, { name, description = '' }: ItemPayload | any) {
      let res;
      const client = await pgsql.connect();
      if (client) {
        try {
          res = await client.query(`
            INSERT INTO items(name, description, complete) VALUES($1, $2, $3) RETURNING *
          `, [name, description, false]);
        } finally {
          client.release();
        }
      }
      return res && res.rows[0];
    },
    async updateItem(_: any, { id, name, description, complete }: ItemPayload | any) {
      let res;
      const client = await pgsql.connect();
      if (client) {
        const values = [id];
        const updateQuery: string[] = [];
        const updateValues: UpdatePayload = {
          name,
          description,
          complete,
        };
        Object.keys(updateValues).forEach(key => {
          const value = updateValues[key as keyof UpdatePayload];
          if (value !== undefined) {
            updateQuery.push(`${key} = $${values.length + 1}`);
            values.push(value);
          }
        });
        try {
          res = await client.query(`
            UPDATE items SET ${updateQuery.join(',')} WHERE id = $1 RETURNING *
          `, values);
        } finally {
          client.release();
        }
      }
      return res && res.rows[0];
    },
    async deleteItem(_: any, { id }: { id: number } | any) {
      let res;
      const client = await pgsql.connect();
      if (client) {
        try {
          res = await client.query(`
            DELETE FROM items where id = $1 RETURNING *
          `, [id]);
        } finally {
          client.release();
        }
      }
      return res && res.rows[0];
    },
  },
};
