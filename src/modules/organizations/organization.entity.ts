import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Membership } from "../memberships/membership.entity";

@Entity()
export class Organization {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    subscription_plan!: string;

    @OneToMany(() => Membership, (membership) => membership.organization)
    memberships!: Membership[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}