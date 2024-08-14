import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { autenticarToken } from "../user/login";

interface Banco {
  id?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoDeConta?: string;
}

const paramsSchema = z.object({
  bancoId: z.string().uuid(),
  AdminId: z.string().uuid()
});

const requestBodySchema = z.object({
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  tipoDeConta: z.string().optional(),
});

export async function editBancoParaAdmin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/banco/:bancoId/:AdminId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All Banco",
        tags: ["Banco"],
        headers: z.object({
          authorization: z.string()
        }),
        params: paramsSchema,
        body: requestBodySchema,
        response: {
          200: z.object({
            message: z.string()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { bancoId, AdminId } = paramsSchema.parse(request.params);
      const { banco, agencia, conta, tipoDeConta } = requestBodySchema.parse(
        request.body
      );

      const updateData: Banco = {};

      if (banco) {
        updateData.banco = banco;
      }
      if (agencia) {
        updateData.agencia = agencia;
      }
      if (conta) {
        updateData.conta = conta;
      }
      if (tipoDeConta) {
        updateData.tipoDeConta = tipoDeConta;
      }

      const bancos = await prisma.banco.update({
        where: {
          id: bancoId,
          userId: AdminId
        },
        data: updateData,
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

      return reply
        .status(200)
        .send({ message: "Banco atualizado com sucesso" });
    }
  );
}