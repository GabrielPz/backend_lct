import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestBodySchema = z.object({
  title: z.string(),
  idContratacaoPNCP: z.string(),
  modalidadeDaContratacao: z.string(),
  ultimaAtualizacao: z.string(),
  orgao: z.string(),
  local: z.string(),
  estado: z.string(),
  objeto: z.string(),
  fornecedorId: z.string().uuid(),
  pncpId: z.string(),
  itemProposta: z.array(
    z.object({
      numeroItem: z.number(),
      descricao: z.string(),
      valorUnitarioEstimado: z.number(),
      valorTotalEstimado: z.number(),
      quantidade: z.number(),
      unidadeMedida: z.string(),
      tipo: z.string(),
      categoria: z.string(),
      beneficios: z.string(),
      situacao: z.string(),
      produtoManufaturado: z.boolean(),
      criterioJulgamento: z.string(),
    })
  ),
  editalProposta: z.array(
    z.object({
      nome: z.string(),
      titulo: z.string(),
      status: z.boolean(),
      descricao: z.string(),
      dataPublicacaoPNCP: z.string(),
      sequencialEdital: z.number(),
      cnpj: z.string(),
      ano: z.number(),
      url: z.string(),
    })
  )
});

export async function createProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/proposta",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Create Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Proposta"],
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
        title,
        idContratacaoPNCP,
        modalidadeDaContratacao,
        ultimaAtualizacao,
        orgao,
        local,
        estado,
        objeto,
        fornecedorId,
        pncpId,
        itemProposta,
        editalProposta
      } = requestBodySchema.parse(request.body);

      const proposta = await prisma.proposta.create({
        data: {
          title,
          idContratacaoPNCP,
          modalidadeDaContratacao,
          ultimaAtualizacao,
          orgao,
          estado,
          local,
          objeto,
          fornecedorId,
          pncpId
        },
        select: {
          id: true
        }
      });

      if (!proposta) {
        return reply.status(400).send({ message: "Error on create Proposta" });
      }

      if (itemProposta) {
        const createdItemProposta = await prisma.itemProposta.createMany({
          data: itemProposta.map((item) => {
            return {
              ...item,
              propostaId: proposta.id
            };
          })
        });

        if (!createdItemProposta) {
          return reply
            .status(400)
            .send({ message: "Error on create ItemProposta" });
        }
      }

      if (editalProposta) {
        const createEditalProposta = await prisma.editalProposta.createMany({
          data: editalProposta.map((edital) => {
            return {
              ...edital,
              propostaId: proposta.id
            };
          })
        });

        if (!createEditalProposta) {
          return reply
            .status(400)
            .send({ message: "Error on create EditalProposta" });
        }
      }

      const progresso = await prisma.progresso.create({
        data: {
          descricao: "Aguardando aprovação",
          propostaId: proposta.id
        }
      });

      if (!progresso) {
        return reply.status(400).send({ message: "Error on create Progresso" });
      }

      return reply
        .status(200)
        .send({ message: "Proposta created successfully" });
    }
  );
};
