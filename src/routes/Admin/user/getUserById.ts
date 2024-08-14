import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "./login";
import moment from "moment-timezone";

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

export async function getUserById (app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/user/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get User By Id",
        tags: ["User"],
        headers: z.object({
          authorization: z.string()
        }),
        params: requestParamsSchema,
        response: {
          200: z.object({
            id: z.string().uuid(),
            nome: z.string(),
            email: z.string().email(),
            createdAt: z.string(),
            profilePhoto: z.string().optional().nullish()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { id } = requestParamsSchema.parse(request.params);

      try {
        const user = await prisma.user.findUnique({
          where: {
            id
          }, select: {
            id: true,
            nome: true,
            email: true,
            createdAt: true,
            profilePhoto: true
          }
        });

        if (!user) {
          reply.status(400).send({ message: "User not found" });
          return;
        }

        const formattedUser = {
          ...user,
          createdAt: moment.tz(user.createdAt, "America/Sao_Paulo").format("DD/MM/YYYY HH:mm:ss")
        };

        reply.status(200).send(formattedUser);
      } catch (error) {
        reply.status(400).send({ message: error.message });
      }
    }
  );
};