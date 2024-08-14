import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

export async function deleteFornecedor(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/fornecedor/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Delete Fornecedor",
        tags: ["Fornecedor"],
        headers: z.object({
          authorization: z.string()
        }),
        params: z.object({
          id: z.string().uuid()
        }),
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
      const { id } = z
        .object({
          id: z.string().uuid()
        })
        .parse(request.params);

      const fornecedor = await prisma.fornecedor.delete({
        where: {
          id: id
        },
        include: {
          areaAtuacao: true,
          Proposta: true
        }
      });

      if (!fornecedor) {
        return reply.status(400).send({ message: "Fornecedor not found" });
      }

      return reply.send({ message: "Fornecedor deleted" });
    }
  );
}