import { FastifyInstance, FastifyPluginOptions } from "fastify";

import {
    deleteUser,
    editUser,
    forgotPassword,
    getAllUsers,
    loginUser,
    registerUser,
    resetPassword,
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

const forgotPasswordSchema = {
    schema: {
        body: {
            type: "object",
            required: ["email"],
            additionalProperties: false,
            properties: {
                email: { type: "string" },
            },
        },
    },
};

const resetPasswordSchema = {
    schema: {
        body: {
            type: "object",
            required: ["token", "newPassword"],
            additionalProperties: false,
            properties: {
                token: { type: "string" },
                newPassword: { type: "string", minLength: 8 },
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
    fastify.post("/forgot-password", forgotPasswordSchema, forgotPassword);
    fastify.post("/reset-password", resetPasswordSchema, resetPassword);
}

export default userRouter;
