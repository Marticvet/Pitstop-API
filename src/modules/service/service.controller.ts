import { FastifyReply, FastifyRequest } from "fastify";
import MysqlDataSource from "../../app/db/db.connect";
import { Service } from "./service.entity";

type CreateServiceBody = {
    organizationId: number;
    name: string;
    durationMinutes: number;
    price: number;
    currency: number;
    isActive: boolean;
};

type EditServiceBody = {
    organizationId: number;
    name: string;
    durationMinutes: number;
    price: number;
    currency: number;
    isActive: boolean;
};

const serviceRepo = MysqlDataSource.getRepository(Service);

export async function getAllServices(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const services = await serviceRepo
            .createQueryBuilder("service")
            .getMany();

        return reply.code(200).send(services);
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function createService(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const {
            organizationId,
            name,
            durationMinutes,
            price,
            currency,
            isActive
        } = request.body as CreateServiceBody;

        const errors = [];

        if (!name || name.trim().length < 3) {
            errors.push({
                field: "name",
                message: "Name must be at least 3 characters long",
            });
        }

        // if (!subscription_plan || subscription_plan.trim().length < 3) {
        //     errors.push({
        //         field: "subscription_plan",
        //         message: "Subscription plan must be at least 3 characters long",
        //     });
        // }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}
