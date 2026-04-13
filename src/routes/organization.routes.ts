import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getOrganizationById, getAllOrganizations, createOrganization, editOrganization, deleteOrganization } from "../controllers/organizationController";

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

async function organizationRouter(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get("", getAllOrganizations);
    fastify.get("/:organizationId", getOrganizationById);
    fastify.post("/:organizationId", options, createOrganization);
    fastify.put("/:organizationId", options, editOrganization);
    fastify.delete("/:organizationId", options, deleteOrganization);
}

export default organizationRouter;
