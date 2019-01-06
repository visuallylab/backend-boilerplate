import { Field, ObjectType, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne } from 'typeorm';

import User from './User';

@Entity()
@ObjectType()
class Item {

  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public readonly id!: number;

  @Field()
  @Column({ length: 30 })
  public name!: string;

  @Field()
  @Column({ length: 100 })
  public description?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: false })
  public complete?: boolean;

  @Field(() => User)
  @ManyToOne(() => User, user => user.items)
  public user!: User;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;
}

export default Item;
