import MysqlDataSource from "../../app/db/db.connect";
import { Organization } from "../organizations/organization.entity";
import { User } from "../users/user.entity";
import { MembershipRole } from "./membership-role.enum";
import { Membership } from "./membership.entity";

import { FastifyReply, FastifyRequest } from "fastify";

type OrganizationParams = {
    organizationId: string;
};

type CreateMembershipBody = {
    userId: number;
    role: MembershipRole;
};

const membershipRepo = MysqlDataSource.getRepository(Membership);
const userRepo = MysqlDataSource.getRepository(User);
const organizationRepo = MysqlDataSource.getRepository(Organization);

export async function createMembership(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId } = request.params as OrganizationParams;
        const { userId, role } = request.body as CreateMembershipBody;

        const userExist = await userRepo
            .createQueryBuilder("user")
            .where("user.id = :id", { id: userId })
            .getOne();

        if (!userExist) {
            return reply.code(404).send({
                msg: "User not found",
            });
        }

        const organizationExist = await organizationRepo
            .createQueryBuilder("organization")
            .where("organization.id = :id", { id: organizationId })
            .getOne();

        if (!organizationExist) {
            return reply.code(404).send({
                msg: "Organization not found",
            });
        }

        const orgId = Number(organizationId);

        if (Number.isNaN(orgId)) {
            return reply.code(400).send({
                msg: "Invalid organization id",
            });
        }

        const membershipExist = await membershipRepo
            .createQueryBuilder("membership")
            .where("membership.userId = :userId", { userId })
            .andWhere("membership.organizationId = :organizationId", {
                organizationId: orgId,
            })
            .getOne();

        if (membershipExist) {
            return reply.code(409).send({
                msg: "User is already a member of this organization",
            });
        }

        const createdMembership = await membershipRepo
            .createQueryBuilder("membership")
            .insert()
            .into(Membership)
            .values({
                userId,
                organizationId: orgId,
                role,
            })
            .execute();

        if (!createdMembership.identifiers[0]?.id) {
            return reply.code(400).send({
                msg: "Unable to create membership",
            });
        }

        return reply.code(201).send({
            msg: "Membership created successfully",
            data: {
                id: createdMembership.identifiers[0].id,
                userId,
                organizationId: orgId,
                role,
            },
        });
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}
