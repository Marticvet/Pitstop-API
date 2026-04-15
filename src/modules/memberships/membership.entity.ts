import { MembershipRole } from "./membership-role.enum";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Organization } from "../organizations/organization.entity";

@Entity()
@Unique(["userId", "organizationId"])
export class Membership {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    organizationId!: number;

    @Column({
        type: "enum",
        enum: MembershipRole,
    })
    role!: MembershipRole;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => User, (user) => user.memberships, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @ManyToOne(() => Organization, (organization) => organization.memberships, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "organizationId" })
    organization!: Organization;
}
