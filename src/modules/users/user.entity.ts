import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Membership } from "../memberships/membership.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Index({ unique: true })
    email!: string;

    @Column({ select: false })
    password!: string;

    @Column()
    first_name!: string;

    @Column()
    last_name!: string;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    update_at!: Date;

    @OneToMany(() => Membership, (membership) => membership.user)
    memberships!: Membership[];
}