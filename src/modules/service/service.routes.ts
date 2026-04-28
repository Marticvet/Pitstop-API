import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
    createService,
    editService,
    getAllServices,
    getServiceById,
} from "./service.controller";

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
                organizationId: { type: "number" },
                durationMinutes: { type: "number" },
                price: { type: "number" },
                currency: { type: "string", minLength: 1 },
                isActive: { type: "boolean" },
                name: { type: "string", minLength: 1 },
            },
        },
    },
};

async function serviceRouter(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get("", getAllServices);
    fastify.post("", options, createService);
    fastify.get("/:serviceId", getServiceById);
    fastify.put("/:serviceId", options, editService);
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
