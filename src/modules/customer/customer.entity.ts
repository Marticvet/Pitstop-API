import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { Organization } from "../organizations/organization.entity";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    organizationId!: number;

    @ManyToOne(() => Organization, (organization) => organization.customers, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "organizationId" })
    organization!: Organization;

    @Column()
    full_name!: string;

    @Column()
    phone!: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ type: "text", nullable: true })
    notes?: string;

    @Column("json", { nullable: true })
    tags?: string[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}