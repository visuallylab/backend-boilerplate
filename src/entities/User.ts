import { Authorized, Field, ObjectType, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, OneToMany } from 'typeorm';

import Item from './Item';

@Entity()
@ObjectType()
class User {
  @Authorized()
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public uuid: string;

  // @Field() no need to query
  @Column()
  public password: string;

  @Field()
  @Column()
  public displayName: string;

  @Field()
  @Column()
  public email: string;

  @Field()
  @Column({ nullable: true })
  public avatar?: string;

  @Authorized()
  @Field(() => [Item])
  @OneToMany(() => Item, item => item.user)
  public items: Item[];

  @Authorized()
  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Authorized()
  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;
}

export default User;
