import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../../lib/prisma";
import { autenticarToken } from "../../user/login";

const requestBodySchema = z.object({
  valorUnitarioEstimado: z.number(),
  valorTotalEstimado: z.number(),
  quantidade: z.number(),
  itemPropostaId: z.string().uuid(),
  propostaId: z.string().uuid(),
  fornecedorId: z.string().uuid()
}); // altera apenas o valor unitário

export async function criarPropostaItem(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fornecedor/proposta-item",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Create Proposta Item",
        tags: ["Fornecedor"],
        headers: z.object({
          authorization: z.string()
        }),
        body: requestBodySchema,
        response: {
          200: z.object({
            id: z.string().uuid(),
            valorUnitarioEstimado: z.number(),
            valorTotalEstimado: z.number(),
            quantidade: z.number(),
            itemPropostaId: z.string().uuid(),
            propostaId: z.string().uuid(),
            isRead: z.boolean(),
            fornecedorId: z.string().uuid()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const {
        valorUnitarioEstimado,
        valorTotalEstimado,
        quantidade,
        itemPropostaId,
        propostaId,
        fornecedorId
      } = requestBodySchema.parse(request.body);

      const searchItemProposta = await prisma.itemProposta.findUnique({
        where: {
          id: itemPropostaId
        },
        select: {
          isApproved: true
        }
      });

      if (!searchItemProposta) {
        return reply.status(400).send({ message: "ItemProposta not found" });
      }

      if (searchItemProposta.isApproved) {
        return reply
          .status(400)
          .send({ message: "ItemProposta is already approved" });
      }

      const propostaItem = await prisma.fornecedorItemProposta.upsert({
        where: {
          itemPropostaId
        },
        create: {
          valorUnitarioEstimado,
          valorTotalEstimado,
          quantidade,
          itemPropostaId,
          propostaId,
          fornecedorId,
          isRead: false,
          isApproved: false
        },
        update: {
          valorUnitarioEstimado,
          valorTotalEstimado,
          quantidade,
          itemPropostaId,
          propostaId,
          fornecedorId,
          isRead: false,
          isApproved: false
        },
        select: {
          id: true,
          valorUnitarioEstimado: true,
          valorTotalEstimado: true,
          quantidade: true,
          itemPropostaId: true,
          propostaId: true,
          isRead: true,
          fornecedorId: true
        }
      });

      if (!propostaItem) {
        return reply
          .status(400)
          .send({ message: "Error creating proposta item" });
      }

      return reply.send(propostaItem);
    }
  );
}
