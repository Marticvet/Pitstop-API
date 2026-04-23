import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getAllServices } from "./service.controller";

const options = {
    schema: {
        body: {
            type: "object",
            required: [
                "organizationId",
                "name",
                "durationMinutes",
                "price",
                "currency",
                "isActive",
            ],
            additionalProperties: false,
            properties: {
                organizationId: { type: "number", length: 1},
                durationMinutes: { type: "number" },
                price: { type: "number" },
                currency: { type: "number" },
                isActive: { type: "boolean" },
                name: { type: "string" },
            },
        },
    },
};

async function serviceRouter(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get("", options, getAllServices);
}

export default serviceRouter;

// ## D. Service management

// * create service
// * update pricing
// * activate/deactivate

// Endpoints:

// * POST /services
// * GET /services
// * PATCH /services/:id
