import MysqlDataSource from "../db/db.connect";
import { Roles } from "../entities/Roles";

import { FastifyInstance, FastifyPluginOptions } from "fastify";

type RoleBody = {
    role: string;
};

type RoleParams = {
    roleId: number;
};

const baseUrl = "/roles";

const options = {
    schema: {
        body: {
            type: "object",
            required: ["role"],
            additionalProperties: false,
            properties: {
                role: { type: "string", minLength: 3 },
            },
        },
    },
};

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default function rolesRoute(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    const roleRepo = MysqlDataSource.getRepository(Roles);

    fastify.get(baseUrl, async (request, reply) => {
        const roles = await roleRepo.find();

        return reply.send(roles);
    });

    fastify.get<{ Params: RoleParams }>(
        `${baseUrl}/:roleId`,
        async (reqest, reply) => {
            const { roleId } = reqest.params;

            const roleExist = await roleRepo
                .createQueryBuilder()
                .where("roles.id = :id", { id: roleId })
                .getOne();

            if (roleExist === null) {
                return reply.code(404).send({
                    msg: `Role not found!`,
                });
            }

            return reply.code(200).send(roleExist);
        }
    );

    fastify.post<{ Body: RoleBody }>(
        baseUrl,
        options,
        async (request, reply) => {
            const { role } = request.body;

            const errors = [];

            if (!role || role.trim().length < 3) {
                errors.push({
                    field: "role",
                    message: "Role must be at least 3 characters long",
                });
            }
            if (errors.length > 0) {
                return reply.code(400).send({
                    error: "Validation Error",
                    details: errors,
                });
            }

            const insertedRole = await roleRepo
                .createQueryBuilder()
                .insert()
                .into(Roles)
                .values({ role })
                .execute();

            const roleId = insertedRole.identifiers[0]?.id;

            const createdRole = await roleRepo
                .createQueryBuilder()
                .where("roles.id = :id", { id: roleId })
                .getOne();

            if (insertedRole.raw && insertedRole.raw.affectedRows === 1) {
                return reply.send({
                    msg: "New role has been successfully created!",
                    data: createdRole,
                });
            } else if (
                insertedRole.raw &&
                insertedRole.raw.affectedRows === 0
            ) {
                return reply.code(400).send({
                    msg: "Something went wrong. Please try again later!",
                });
            }
        }
    );

    fastify.put<{ Params: RoleParams; Body: RoleBody }>(
        `${baseUrl}/:roleId`,
        async (reqest, reply) => {
            const { roleId } = reqest.params;
            const { role } = reqest.body;

            const errors = [];

            if (!role || role.trim().length < 3) {
                errors.push({
                    field: "role",
                    message: "Role must be at least 3 characters long",
                });
            }

            if (errors.length > 0) {
                return reply.code(400).send({
                    error: "Validation Error",
                    details: errors,
                });
            }

            const roleExist = await roleRepo
                .createQueryBuilder()
                .where("roles.id = :id", { id: roleId })
                .getOne();

            if (roleExist === null) {
                return reply.code(404).send({
                    msg: `Role not found!`,
                });
            }

            const updateRole = await roleRepo
                .createQueryBuilder()
                .update(Roles)
                .set({ role: role })
                .where("roles.id = :id", { id: roleId })
                .execute();

            const updatedRole = await roleRepo
                .createQueryBuilder()
                .where("roles.id = :id", {
                    id: roleId,
                })
                .getOne();

            if (updateRole.affected === 1) {
                return reply.code(200).send({
                    msg: "Role has been successfully updated!",
                    data: updatedRole,
                });
            } else if (updateRole.affected === 0) {
                return reply.code(400).send({
                    msg: "Something went wrong. Please try again later!",
                });
            }
        }
    );

    fastify.delete<{ Params: RoleParams }>(
        `${baseUrl}/:roleId`,
        async (request, reply) => {
            const { roleId } = request.params;

            const roleExist = await roleRepo
                .createQueryBuilder()
                .where("roles.id = :id", { id: roleId })
                .getOne();

            if (roleExist === null) {
                return reply.code(400).send({
                    msg: `Role not found!`,
                });
            }

            const deletedRole = await roleRepo
                .createQueryBuilder()
                .delete()
                .where("id = :id", { id: roleId })
                .execute();

            if (deletedRole.affected === 1) {
                return reply.code(200).send({
                    msg: `Role with id ${roleId} has been deleted!`,
                });
            } else if (deletedRole.affected === 0) {
                return reply.code(400).send({
                    msg: "Something went wrong. Please try again later!",
                });
            }
        }
    );
}
