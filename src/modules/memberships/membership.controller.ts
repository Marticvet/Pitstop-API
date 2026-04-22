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

type EditMembershipBody = {
    userId: number;
    role: MembershipRole;
};

type GetMembershipParams = {
    organizationId: string;
    membershipId: string;
};

type DeleteMembershipParams = {
    organizationId: string;
    userId: string;
};

const membershipRepo = MysqlDataSource.getRepository(Membership);
const userRepo = MysqlDataSource.getRepository(User);
const organizationRepo = MysqlDataSource.getRepository(Organization);

export async function getMembershipByUserAndOrganization(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { organizationId, userId } = request.params as {
        organizationId: string;
        userId: string;
    };

    const orgId = Number(organizationId);
    const usrId = Number(userId);

    if (Number.isNaN(orgId)) {
        return reply.code(400).send({ msg: "Invalid organization id" });
    }

    if (Number.isNaN(usrId)) {
        return reply.code(400).send({ msg: "Invalid user id" });
    }

    const membership = await membershipRepo
        .createQueryBuilder("membership")
        .where("membership.organizationId = :organizationId", {
            organizationId: orgId,
        })
        .andWhere("membership.userId = :userId", {
            userId: usrId,
        })
        .getOne();

    if (!membership) {
        return reply.code(404).send({ msg: "Membership not found" });
    }

    return reply.code(200).send(membership);
}

export async function getMembershipsByRole(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { organizationId, role } = request.params as {
        organizationId: string;
        role: MembershipRole;
    };

    const orgId = Number(organizationId);

    if (Number.isNaN(orgId)) {
        return reply.code(400).send({ msg: "Invalid organization id" });
    }

    const memberships = await membershipRepo
        .createQueryBuilder("membership")
        .where("membership.organizationId = :organizationId", {
            organizationId: orgId,
        })
        .andWhere("membership.role = :role", { role })
        .getMany();

    return reply.code(200).send(memberships);
}

export async function getMembershipsByUserId(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { userId } = request.params as { userId: string };
    const usrId = Number(userId);

    if (Number.isNaN(usrId)) {
        return reply.code(400).send({ msg: "Invalid user id" });
    }

    const memberships = await membershipRepo
        .createQueryBuilder("membership")
        .where("membership.userId = :userId", { userId: usrId })
        .getMany();

    return reply.code(200).send(memberships);
}

export async function getMembershipsByOrganization(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { organizationId } = request.params as { organizationId: string };
    const orgId = Number(organizationId);

    if (Number.isNaN(orgId)) {
        return reply.code(400).send({ msg: "Invalid organization id" });
    }

    const memberships = await membershipRepo
        .createQueryBuilder("membership")
        .where("membership.organizationId = :organizationId", {
            organizationId: orgId,
        })
        .getMany();

    return reply.code(200).send(memberships);
}

export async function getMembershipById(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId, membershipId } =
            request.params as GetMembershipParams;

        const orgId = Number(organizationId);
        if (Number.isNaN(orgId)) {
            return reply.code(400).send({
                msg: "Invalid organization id",
            });
        }

        const membId = Number(membershipId);
        if (Number.isNaN(membId)) {
            return reply.code(400).send({
                msg: "Invalid membership id",
            });
        }

        const organizationExist = await organizationRepo
            .createQueryBuilder("organization")
            .where("organization.id = :id", { id: orgId })
            .getOne();

        if (!organizationExist) {
            return reply.code(404).send({
                msg: "Organization not found",
            });
        }

        const membership = await membershipRepo
            .createQueryBuilder("membership")
            .where("membership.organizationId = :organizationId", {
                organizationId: orgId,
            })
            .andWhere("membership.id = :id", { id: membId })
            .getOne();

        if (!membership) {
            return reply.code(404).send({
                msg: "Membership not found",
            });
        }

        return reply.code(200).send(membership);
    } catch (error) {
        console.error(error);
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

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
        console.error(error);
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function editMembership(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId } = request.params as OrganizationParams;
        const { userId, role } = request.body as EditMembershipBody;

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

        const editedMembership = await membershipRepo
            .createQueryBuilder("membership")
            .update(Membership)
            .set({ role })
            .where("userId = :userId", { userId })
            .andWhere("organizationId = :organizationId", {
                organizationId: orgId,
            })
            .execute();

        if (editedMembership.affected === 0) {
            return reply.code(404).send({
                msg: "Unable to edit membership",
            });
        }

        return reply.code(200).send({
            msg: "Membership edited successfully",
            data: {
                userId,
                organizationId: orgId,
                role,
            },
        });
    } catch (error) {
        console.error(error);
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function deleteMembership(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId, userId } =
            request.params as DeleteMembershipParams;

        const orgId = Number(organizationId);
        const usrId = Number(userId);

        if (Number.isNaN(orgId)) {
            return reply.code(400).send({ msg: "Invalid organization id" });
        }

        if (Number.isNaN(usrId)) {
            return reply.code(400).send({ msg: "Invalid user id" });
        }

        const result = await membershipRepo
            .createQueryBuilder()
            .delete()
            .from(Membership)
            .where("organizationId = :organizationId", {
                organizationId: orgId,
            })
            .andWhere("userId = :userId", { userId: usrId })
            .execute();

        if (result.affected === 0) {
            return reply.code(404).send({
                msg: "Membership not found",
            });
        }

        return reply.code(200).send({
            msg: "Membership deleted successfully",
        });
    } catch (error) {
        console.error(error);
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}
