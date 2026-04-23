import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
    createCustomer,
    deleteCustomer,
    editCustomerByOrganizationId,
    getAllOrganizationsByCustomerId,
    getCustomerByOrganizationId,
    getCustomers,
} from "./customer.controller";

const options = {
    schema: {
        body: {
            type: "object",
            required: ["full_name", "phone"],
            additionalProperties: false,
            properties: {
                full_name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                notes: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
            },
        },
    },
};

const getCustomersSchema = {
    schema: {
        querystring: {
            type: "object",
            properties: {
                page: { type: "string", pattern: "^[0-9]+$" },
                pageSize: { type: "string", pattern: "^[0-9]+$" },
                search: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                fullName: { type: "string" },
                tags: { type: "string" },
                sortBy: {
                    type: "string",
                    enum: ["createdAt", "updatedAt", "full_name", "email"],
                },
                sortOrder: {
                    type: "string",
                    enum: ["ASC", "DESC"],
                },
            },
        },
    },
};

async function customerRouter(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get(
        "/organizations/:organizationId",
        getAllOrganizationsByCustomerId
    );
    fastify.get(
        "/:customerId/organizations/:organizationId",
        getCustomerByOrganizationId
    );
    fastify.put("/:customerId", options, editCustomerByOrganizationId);
    fastify.post("/organizations/:organizationId", options, createCustomer);
    fastify.delete("/:customerId", deleteCustomer);

    fastify.get("/", getCustomersSchema, getCustomers);
}

export default customerRouter;
