import { getRepository, getConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';

import User from '@/entities/User';

/**
 * clear db table data
 * @param entities: Entity[]
 */
export async function clear(entities?: any[]) {
  try {
    if (!entities) {
      entities = (await getConnection()).entityMetadatas; // if no specific, clear all
    }
    for (const entity of entities) {
      const repository = await getRepository(entity.name);
      await repository.query(`TRUNCATE "${repository.metadata.tableName}" CASCADE`);
    }
  } catch (error) {
    throw new Error(`ERROR: Clear test db: ${error}`);
  }
}

type UserInput = {
  displayName: string;
  email: string;
  password: string;
};

export async function createTestUsers(users: UserInput[]): Promise<User[]> {
  try {
    const userRepository = await getRepository(User);
    const saltedUsers = await Promise.all(users.map(async (user: UserInput) => {
      const saltedHash = await bcrypt.hash(user.password, 10); // salted password

      return {
        ...user,
        password: saltedHash,
      };
    }));

    const createdUsers = await userRepository.create(saltedUsers);
    await userRepository.save(createdUsers);
    return createdUsers;

  } catch (error) {
    throw new Error(`ERROR: Create user ${error}`);
  }
}
