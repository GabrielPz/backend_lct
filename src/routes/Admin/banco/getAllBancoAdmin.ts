import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { autenticarToken } from "../user/login";

const paramsSchema = z.object({
  adminId: z.string().uuid()
});

export async function getAllBancoAdmin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/banco/:adminId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All Banco",
        tags: ["Banco"],
        headers: z.object({
          authorization: z.string()
        }),
        params: paramsSchema,
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              banco: z.string(),
              agencia: z.string(),
              conta: z.string(),
              tipoDeConta: z.string()
            })
          ),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { adminId } = paramsSchema.parse(request.params);

      const bancos = await prisma.banco.findMany({
        where: {
          userId: adminId
        },
        select: {
          id: true,
          banco: true,
          agencia: true,
          conta: true,
          tipoDeConta: true
        }
      });

      if (!bancos) {
        return reply.status(400).send({ message: "Nenhum banco encontrado" });
      }

      return reply.status(200).send(bancos);
    }
  );
};