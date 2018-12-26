import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column } from 'typeorm';

@Entity()
class Items {

  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ length: 30 })
  public name!: string;

  @Column({ length: 100 })
  public description!: string;

  @Column()
  public complete!: boolean;

  @CreateDateColumn()
  public createdAt!: Date;
}

export default Items;
