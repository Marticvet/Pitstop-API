import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    organizationId!: number;
   
    @Column()
    name!: string;

    @Column()
    durationMinutes!: number;

    @Column()
    price!: number;

    @Column()
    currency!: number;

    @Column()
    isActive!: boolean;
}