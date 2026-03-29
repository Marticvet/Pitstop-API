import MysqlDataSource from "../db/db.connect";
import { Roles } from "../entities/Roles";

import { FastifyInstance, FastifyPluginOptions } from "fastify";

type RoleBody = {
    role: string;
};

type RoleParams = {
    roleId: number;
};

const baseUrl = "/roles"
/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default function rolesRoute(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get(baseUrl, async (request, reply) => {
        const roleRepo = MysqlDataSource.getRepository(Roles);

        const roles = await roleRepo.find();

        return reply.send(roles);
    });

    fastify.get<{ Params: RoleParams }>("/roles/:roleId", async (reqest, reply) => {
        const { roleId } = reqest.params;

        const roleRepo =
            MysqlDataSource.getRepository(Roles).createQueryBuilder();

        const roleExist = await roleRepo
            .where("roles.id = :id", { id: roleId })
            .getOne();

        if (roleExist === null) {
            return reply.code(404).send({
                msg: `Role not found!`,
            });
        }

        return reply.code(200).send(roleExist);
    });

    fastify.post<{ Body: RoleBody }>(baseUrl, async (request, reply) => {
        const { role } = request.body;

        if (role.length === 0) {
            return reply.code(400).send({
                msg: "Role cannot be empty!",
            });
        }

        const roleRepo = MysqlDataSource.getRepository(Roles);

        const createRole = await roleRepo
            .createQueryBuilder()
            .insert()
            .into(Roles)
            .values({ role })
            .execute();

        if (createRole.raw && createRole.raw.affectedRows === 1) {
            return reply.send({
                msg: "New role has been successfully created!",
                data: { role: role },
            });
        } else if (createRole.raw && createRole.raw.affectedRows === 0) {
            return reply.code(400).send({
                msg: "Something went wrong. Please try again later!",
            });
        }
    });

    fastify.put<{ Params: RoleParams; Body: RoleBody }>(
        `${baseUrl}/:roleId`,
        async (reqest, reply) => {
            const { roleId } = reqest.params;
            const { role } = reqest.body;

            const roleRepo =
                MysqlDataSource.getRepository(Roles).createQueryBuilder();

            const roleExist = await roleRepo
                .where("roles.id = :id", { id: roleId })
                .getOne();

            if (roleExist === null) {
                return reply.code(404).send({
                    msg: `Role not found!`,
                });
            }

            const updateRole = await roleRepo
                .update(Roles)
                .set({ role: role })
                .where("roles.id = :id", { id: roleId })
                .execute();

            if (updateRole.affected === 1) {
                return reply.code(200).send({
                    msg: "Role has been successfully updated!",
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

            const roleRepo =
                MysqlDataSource.getRepository(Roles).createQueryBuilder();

            const roleExist = await roleRepo
                .where("roles.id = :id", { id: roleId })
                .getOne();

            if (roleExist === null) {
                return reply.code(400).send({
                    msg: `Role not found!`,
                });
            }

            const deletedRole = await roleRepo
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
