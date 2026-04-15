import { FastifyInstance, FastifyPluginOptions } from "fastify";

import {
    deleteUser,
    editUser,
    getAllUsers,
    loginUser,
    registerUser,
} from "./user.controller";

import { auth } from "../../app/shared/middlewares/auth";

const options = {
    schema: {
        body: {
            type: "object",
            required: [
                "email",
                "password",
                "first_name",
                "last_name",
                "isActive",
            ],
            additionalProperties: false,
            properties: {
                email: { type: "string" },
                password: { type: "string" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                isActive: { type: "boolean" },
            },
        },
    },
};

async function userRouter(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
) {
    fastify.get("", getAllUsers);
    fastify.post("/login", options, loginUser);
    fastify.post("/register", options, registerUser);
    fastify.put("/:userId", { preHandler: auth, ...options }, editUser); // protected route
    fastify.delete("/:userId", { preHandler: auth }, deleteUser); // protected route
}

export default userRouter;
