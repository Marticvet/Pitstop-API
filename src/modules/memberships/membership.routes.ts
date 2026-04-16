import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
    createMembership,
    deleteMembership,
    editMembership,
    getMembershipById,
    getMembershipByUserAndOrganization,
    getMembershipsByOrganization,
    getMembershipsByRole,
    getMembershipsByUserId,
} from "./membership.controller";
import { auth } from "../../app/shared/middlewares/auth";

const options = {
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
    fastify.get(
        "/users/:userId/memberships",
        { preHandler: auth },
        getMembershipsByUserId
    ); // get membership by userId

    fastify.get(
        "/organizations/:organizationId/memberships",
        { preHandler: auth },
        getMembershipsByOrganization
    );

    fastify.get(
        "/organizations/:organizationId/memberships/role/:role",
        { preHandler: auth },
        getMembershipsByRole
    );

    fastify.get(
        "/organizations/:organizationId/memberships/user/:userId",
        { preHandler: auth },
        getMembershipByUserAndOrganization
    );

    fastify.get(
        "/organizations/:organizationId/memberships/:membershipId",
        { preHandler: auth },
        getMembershipById
    );

    fastify.post(
        "/organizations/:organizationId/memberships",
        { preHandler: auth, ...options },
        createMembership
    );

    fastify.put(
        "/organizations/:organizationId/memberships/user/:userId",
        { preHandler: auth, ...options },
        editMembership
    );

    fastify.delete(
        "/organizations/:organizationId/memberships/user/:userId",
        {preHandler: auth},
        deleteMembership
    )
}

export default membershipRouter;
