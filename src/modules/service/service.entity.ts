import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    organizationId!: number;

    @Column()
    name!: string;

    @Column({
        name: "durationMinutes",
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0.0,
    })
    durationMinutes!: number;

    @Column({
        name: "price",
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0.0,
    })
    price!: number;

    @Column()
    currency!: string;

    @Column()
    isActive!: boolean;
}
