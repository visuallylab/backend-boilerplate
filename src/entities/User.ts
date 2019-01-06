import { Field, ObjectType, ID } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, OneToMany } from 'typeorm';

import Item from './Item';

@Entity()
@ObjectType()
class User {

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public uuid!: string;

  @Field()
  @Column()
  public name!: string;

  @Field()
  @Column()
  public email!: string;

  @Field()
  @Column({ nullable: true })
  public avatar?: string;

  @Field(() => [Item])
  @OneToMany(() => Item, item => item.user)
  public items!: Item[];

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;
}

export default User;
