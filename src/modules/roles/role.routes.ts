import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "./role.controller";

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

async function roleRouter(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get("", getAllRoles);
    fastify.get("/:roleId", getRoleById);
    fastify.post("", options, createRole);
    fastify.put("/:roleId", options, updateRole);
    fastify.delete("/:roleId", options, deleteRole);
}

export default roleRouter;
