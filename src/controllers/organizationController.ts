import MysqlDataSource from "../db/db.connect";
import { Organization } from "../entities/Organization";

import { FastifyReply, FastifyRequest } from "fastify";

type OrganizationParams = {
    organizationId: number;
};

type OrganizationBody = {
    name: string;
    subscription_plan: string;
};

const organizationRepo = MysqlDataSource.getRepository(Organization);

export async function getAllOrganizations(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const Organizations = await organizationRepo.find();

        return reply.send(Organizations);
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function getOrganizationById(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId } = request.params as OrganizationParams;

        const organizationExist = await organizationRepo
            .createQueryBuilder()
            .where("Organization.id = :id", { id: organizationId })
            .getOne();

        if (organizationExist === null) {
            return reply.code(404).send({
                msg: `Organization not found!`,
            });
        }

        return reply.code(200).send(organizationExist);
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function createOrganization(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { name, subscription_plan } = request.body as OrganizationBody;

        const errors = [];

        if (!name || name.trim().length < 3) {
            errors.push({
                field: "name",
                message: "Name must be at least 3 characters long",
            });
        }

        if (!subscription_plan || subscription_plan.trim().length < 3) {
            errors.push({
                field: "subscription_plan",
                message: "Subscription plan must be at least 3 characters long",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const insertResult = await organizationRepo
            .createQueryBuilder()
            .insert()
            .into(Organization)
            .values({ name, subscription_plan })
            .execute();

        const insertedId = insertResult.identifiers[0]?.id;

        const createdOrganization = await organizationRepo
            .createQueryBuilder()
            .where("organization.id = :id", {
                id: insertedId,
            })
            .getOne();

        if (insertResult.raw && insertResult.raw.affectedRows === 1) {
            return reply.send({
                msg: "New organization has been successfully created!",
                data: createdOrganization,
            });
        } else if (insertResult.raw && insertResult.raw.affectedRows === 0) {
            return reply.code(400).send({
                msg: "Something went wrong. Please try again later!",
            });
        }
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function editOrganization(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId } = request.params as OrganizationParams;
        const { name, subscription_plan } = request.body as OrganizationBody;

        const errors = [];

        if (!name || name.trim().length < 3) {
            errors.push({
                field: "name",
                message: "Name must be at least 3 characters long",
            });
        }

        if (!subscription_plan || subscription_plan.trim().length < 3) {
            errors.push({
                field: "subscription_plan",
                message: "Subscription plan must be at least 3 characters long",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const organizationExist = await organizationRepo
            .createQueryBuilder()
            .where("Organization.id = :id", { id: organizationId })
            .getOne();

        if (organizationExist === null) {
            return reply.code(404).send({
                msg: `Organization not found!`,
            });
        }

        const updateOrganization = await organizationRepo
            .createQueryBuilder()
            .update(Organization)
            .set({ name: name, subscription_plan: subscription_plan })
            .where("Organization.id = :id", { id: organizationId })
            .execute();

        const updatedOrganization = await organizationRepo
            .createQueryBuilder()
            .where("organization.id = :id", {
                id: Number(organizationId),
            })
            .getOne();

        if (updateOrganization.affected === 1) {
            return reply.code(200).send({
                msg: "Organization has been successfully updated!",
                data: updatedOrganization,
            });
        } else if (updateOrganization.affected === 0) {
            return reply.code(400).send({
                msg: "Something went wrong. Please try again later!",
            });
        }
    } catch (error) {}
}

export async function deleteOrganization(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId } = request.params as OrganizationParams;

        const roleExist = await organizationRepo
            .createQueryBuilder()
            .where("Organization.id = :id", { id: organizationId })
            .getOne();

        if (roleExist === null) {
            return reply.code(404).send({
                msg: `Organization not found!`,
            });
        }

        const deletedRole = await organizationRepo
            .createQueryBuilder()
            .delete()
            .where("id = :id", { id: organizationId })
            .execute();

        if (deletedRole.affected === 1) {
            return reply.code(200).send({
                msg: `Organization with id ${organizationId} has been deleted!`,
            });
        } else if (deletedRole.affected === 0) {
            return reply.code(400).send({
                msg: "Something went wrong. Please try again later!",
            });
        }
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}
