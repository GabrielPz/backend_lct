import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { autenticarToken } from "../user/login";

const requestBodySchema = z.object({
  banco: z.string(),
  agencia: z.string(),
  conta: z.string(),
  tipoDeConta: z.string()
});

export async function createBancoParaAdmin (app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/banco/:adminId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Create Banco",
        tags: ["Banco"],
        params: z.object({
          adminId: z.string().uuid()
        }),
        headers: z.object({
          authorization: z.string()
        }),
        body: requestBodySchema,
        response: {
          200: z.object({
            id: z.string().uuid(),
            banco: z.string(),
            agencia: z.string(),
            conta: z.string(),
            tipoDeConta: z.string()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { adminId } = request.params;
      const { banco, agencia, conta, tipoDeConta } = requestBodySchema.parse(
        request.body
      );

      const bancoCriado = await prisma.banco.create({
        data: {
          banco,
          agencia,
          conta,
          tipoDeConta,
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

      if (!bancoCriado) {
        return reply.status(400).send({ message: "Banco not created" });
      }

      return bancoCriado;
    }
  );
}
