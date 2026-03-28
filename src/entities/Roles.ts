import { Entity, Column, PrimaryGeneratedColumn,  } from "typeorm";

// extends BaseEntity 
@Entity()
export class Roles{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role: string;
}

// * owner
// * admin
// * manager
// * staff
// * viewer
