import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";

export async function getFornecedor(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/fornecedor/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get Fornecedor",
        tags: ["Fornecedor"],
        headers: z.object({
          authorization: z.string()
        }),
        params: z.object({
          id: z.string().uuid()
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            nome: z.string(),
            email: z.string().email(),
            cnpj: z.string().length(14),
            telefone: z.string().length(11),
            logradouro: z.string(),
            numero: z.string(),
            bairro: z.string(),
            cidade: z.string(),
            estado: z.string().length(2),
            banco: z.string(),
            agencia: z.string(),
            conta: z.string(),
            tipoDeConta: z.string(),
            areaAtuacao: z.array(
              z.object({
                id: z.string().uuid(),
                nome: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
                fornecedorId: z.string().nullable()
              })
            )
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { id } = z
        .object({
          id: z.string().uuid()
        })
        .parse(request.params);

      const fornecedor = await prisma.fornecedor.findUnique({
        where: {
          id: id
        },
        include: {
          areaAtuacao: true
        }
      });

      if (!fornecedor) {
        return reply.status(400).send({ message: "Fornecedor not found" });
      }

      return reply.send(fornecedor);
    }
  );
}
