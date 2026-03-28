import MysqlDataSource from "../db_connection/db_connection";
import { Roles } from "../entities/Roles";

import { FastifyInstance, FastifyPluginOptions } from "fastify";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default function rolesRoute(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get("/", async (request, reply) => {
        const roleRepo = MysqlDataSource.getRepository(Roles);

        const roles = await roleRepo.find();

        return reply.send(roles);
    });
}
