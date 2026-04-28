import { FastifyReply, FastifyRequest } from "fastify";
import MysqlDataSource from "../../app/db/db.connect";
import { Service } from "./service.entity";

type CreateServiceBody = {
    organizationId: number;
    name: string;
    durationMinutes: number;
    price: number;
    currency: string;
    isActive: boolean;
};

type EditServiceBody = {
    organizationId: number;
    name: string;
    durationMinutes: number;
    price: number;
    currency: string;
    isActive: boolean;
};

type ServiceParams = {
    serviceId: number;
}

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
            isActive,
        } = request.body as CreateServiceBody;

        const errors = [];

        if (!name || name.trim().length < 1) {
            errors.push({
                field: "name",
                message: "Name must be at least 1 character long",
            });
        }

        if (!currency || currency.trim().length < 1) {
            errors.push({
                field: "currency",
                message: "Currency must be at least 1 character long",
            });
        }

        if (!currency || currency.trim().length < 1) {
            errors.push({
                field: "currency",
                message: "Currency must be at least 1 character long",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const insertService = await serviceRepo
            .createQueryBuilder("service")
            .insert()
            .into(Service)
            .values({
                organizationId,
                name,
                durationMinutes,
                price,
                currency,
                isActive,
            })
            .execute();

        const insertedId = insertService.identifiers[0]?.id;

        const createdService = await serviceRepo
            .createQueryBuilder("service")
            .where("service.id = :id", { id: insertedId })
            .getOne();

        if (insertService.raw && insertService.raw.affectedRows === 1) {
            return reply.send({
                msg: "New service has been successfully created!",
                data: createdService,
            });
        } else if (insertService.raw && insertService.raw.affectedRows === 0) {
            return reply.code(400).send({
                msg: "Something went wrong. Please try again later!",
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

export async function getServiceById(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { serviceId } = request.params as ServiceParams;

        const serivceExist = await serviceRepo
            .createQueryBuilder()
            .where("service.id = :id", { id: serviceId })
            .getOne();

        if (serivceExist === null) {
            return reply.code(404).send({
                msg: `Service not found!`,
            });
        }

        return reply.code(200).send(serivceExist);
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function editService(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { serviceId } = request.params as ServiceParams;

        const serivceExist = await serviceRepo
            .createQueryBuilder()
            .where("service.id = :id", { id: serviceId })
            .getOne();

        if (serivceExist === null) {
            return reply.code(404).send({
                msg: `Service not found!`,
            });
        }

        return reply.code(200).send(serivceExist);
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}