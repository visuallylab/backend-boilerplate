import { Field, ObjectType, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column } from 'typeorm';

@Entity()
@ObjectType()
class Item {

  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public readonly id!: number;

  @Field(() => String)
  @Column({ length: 30 })
  public name!: string;

  @Field(() => String, { nullable: true, defaultValue: '' })
  @Column({ length: 100 })
  public description?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: false })
  public complete?: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  public createdAt!: Date;
}

export default Item;
