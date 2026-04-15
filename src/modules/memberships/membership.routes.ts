import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { createMembership } from "./membership.controller";
import { auth } from "src/app/shared/middlewares/auth";

const createMembershipOptions = {
    schema: {
        body: {
            type: "object",
            required: ["userId", "role"],
            additionalProperties: false,
            properties: {
                userId: { type: "number" },
                role: {
                    type: "string",
                    enum: ["owner", "admin", "manager", "staff", "viewer"],
                },
            },
        },
    },
};

async function membershipRouter(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.post(
        "/organizations/:organizationId/memberships",
        // { preHandler: auth },
        createMembershipOptions,
        createMembership
    );
}

export default membershipRouter;
