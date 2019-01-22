import { FindOneOptions, getConnection } from 'typeorm';
import { InputType, Field } from 'type-graphql';
// import { InjectConnection } from 'typeorm-typedi-extensions';

@InputType()
export class FindOptions<Entity> implements Partial<FindOneOptions> {

  @Field(() => String, { nullable: true })
  public order?: {
    [P in keyof Entity]?: 'ASC' | 'DESC';
  };

  @Field(() => String, { nullable: true })
  public where?: {
    [key: string]: any;
  };
}

// export async function createEntityFindOptions(entity: string) {

//   const connection = await getConnection();
//   const properties = Object.keys(connection.getMetadata(entity).propertiesMap);
//   console.log(properties);
//   return InputType(`${entity}Options`)(
//     class {
//       public a: string;
//     },
//   );
// }
