import MysqlDataSource from "../db/db.connect";
import { Organization } from "../entities/Organization";

import { FastifyInstance, FastifyPluginOptions } from "fastify";

type OrganizationParams = {
    organizationId: number;
};

type OrganizationBody = {
    name: string;
    subscription_plan: string;
};

const baseUrl = "/organizations";

const options = {
    schema: {
        body: {
            type: "object",
            required: ["name", "subscription_plan"],
            additionalProperties: false,
            properties: {
                name: { type: "string", minLength: 3 },
                subscription_plan: { type: "string", minLength: 3 },
            },
        },
    },
};

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default function OrganizationsRoute(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    const organizationRepo = MysqlDataSource.getRepository(Organization);

    fastify.get(baseUrl, async (request, reply) => {
        const Organizations = await organizationRepo.find();

        return reply.send(Organizations);
    });

    fastify.get<{ Params: OrganizationParams }>(
        `${baseUrl}/:organizationId`,
        async (reqest, reply) => {
            const { organizationId } = reqest.params;

            const organizationExist =
                await organizationRepo.createQueryBuilder()
                    .where("Organization.id = :id", { id: organizationId })
                    .getOne();

            if (organizationExist === null) {
                return reply.code(404).send({
                    msg: `Organization not found!`,
                });
            }

            return reply.code(200).send(organizationExist);
        }
    );

    fastify.post<{ Params: OrganizationParams; Body: OrganizationBody }>(
        baseUrl,
        options,
        async (request, reply) => {
            const { name, subscription_plan } = request.body;

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
                    message:
                        "Subscription plan must be at least 3 characters long",
                });
            }

            if (errors.length > 0) {
                return reply.code(400).send({
                    error: "Validation Error",
                    details: errors,
                });
            }

            const insertResult = await organizationRepo.createQueryBuilder()
                .insert()
                .into(Organization)
                .values({ name, subscription_plan })
                .execute();

            const insertedId = insertResult.identifiers[0]?.id;

            const createdOrganization =
                await organizationRepo.createQueryBuilder()
                    .where("organization.id = :id", {
                        id: insertedId,
                    })
                    .getOne();

            if (insertResult.raw && insertResult.raw.affectedRows === 1) {
                return reply.send({
                    msg: "New organization has been successfully created!",
                    data: createdOrganization,
                });
            } else if (
                insertResult.raw &&
                insertResult.raw.affectedRows === 0
            ) {
                return reply.code(400).send({
                    msg: "Something went wrong. Please try again later!",
                });
            }
        }
    );

    fastify.put<{ Params: OrganizationParams; Body: OrganizationBody }>(
        `${baseUrl}/:organizationId`,
        options,
        async (reqest, reply) => {
            const { organizationId } = reqest.params;
            const { name, subscription_plan } = reqest.body;

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
                    message:
                        "Subscription plan must be at least 3 characters long",
                });
            }

            if (errors.length > 0) {
                return reply.code(400).send({
                    error: "Validation Error",
                    details: errors,
                });
            }

            const organizationExist =
                await organizationRepo.createQueryBuilder()
                    .where("Organization.id = :id", { id: organizationId })
                    .getOne();

            if (organizationExist === null) {
                return reply.code(404).send({
                    msg: `Organization not found!`,
                });
            }

            const updateOrganization =
                await organizationRepo.createQueryBuilder()
                    .update(Organization)
                    .set({ name: name, subscription_plan: subscription_plan })
                    .where("Organization.id = :id", { id: organizationId })
                    .execute();

            const updatedOrganization =
                await organizationRepo.createQueryBuilder()
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
        }
    );

    fastify.delete<{ Params: OrganizationParams }>(
        `${baseUrl}/:organizationId`,
        async (request, reply) => {
            const { organizationId } = request.params;

            const roleExist = await organizationRepo.createQueryBuilder()
                .where("Organization.id = :id", { id: organizationId })
                .getOne();

            if (roleExist === null) {
                return reply.code(404).send({
                    msg: `Organization not found!`,
                });
            }

            const deletedRole = await organizationRepo.createQueryBuilder()
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
        }
    );
}
