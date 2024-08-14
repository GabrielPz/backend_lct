import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../../lib/prisma";
import { autenticarToken } from "../../user/login";

const requestBodySchema = z.object({
  itemPropostaId: z.string().uuid(),
  isApproved: z.boolean()
});

export async function approvedItem(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/fornecedor/proposta-item/accept",
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
            message: z.string()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const {
        itemPropostaId,
        isApproved
      } = requestBodySchema.parse(request.body);

      const searchItemProposta = await prisma.itemProposta.findUnique({
        where: {
          id: itemPropostaId
        },
        select: {
          isApproved
        }
      });

      if (!searchItemProposta) {
        return reply
          .status(400)
          .send({ message: "Error on approved item" });
      }

      if(isApproved == true) {
        return reply.send({ message: "Item approved " });
      } else {
        return reply.send({ message: "Item not approved " });
      }
    }
  );
}
