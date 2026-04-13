import { Entity, Column, PrimaryGeneratedColumn,  } from "typeorm";

// extends BaseEntity 
@Entity()
export class Role{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    role!: string;
}

// * owner
// * admin
// * manager
// * staff
// * viewer
