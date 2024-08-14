import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

interface EditalProposta {
  titulo?: string;
  status?: boolean;
  nome?: string;
  descricao?: string;
  dataPublicacaoPNCP?: string;
  sequencialEdital?: number;
  cnpj?: string;
  ano?: number;
  url?: string;
}

const requestParamsSchema = z.object({
  id: z.string().uuid(),
  propostaId: z.string().uuid()
});

const requestBodySchema = z.object({
  titulo: z.string().optional(),
  status: z.boolean().optional(),
  nome: z.string().optional(),
  descricao: z.string().optional(),
  dataPublicacaoPNCP: z.string().optional(),
  sequencialEdital: z.number().optional(),
  cnpj: z.string().optional(),
  ano: z.number().optional(),
});

export async function editEdital (app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/editalProposta/:id/proposta/:propostaId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Edit Edital",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["EditalProposta"],
        params: requestParamsSchema,
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
      const { id, propostaId } = requestParamsSchema.parse(request.params);
      const {
        titulo,
        status,
        nome,
        descricao,
        dataPublicacaoPNCP,
        sequencialEdital,
        cnpj,
        ano
      } = requestBodySchema.parse(request.body);

      const updateData: EditalProposta = {};

      if (titulo && titulo != null) {
        updateData.titulo = titulo;
      }
      if (status && status != null) {
        updateData.status = status;
      }
      if (nome && nome != null) {
        updateData.nome = nome;
      }
      if (descricao && descricao != null) {
        updateData.descricao = descricao;
      }
      if (dataPublicacaoPNCP && dataPublicacaoPNCP != null) {
        updateData.dataPublicacaoPNCP = dataPublicacaoPNCP;
      }
      if (sequencialEdital && sequencialEdital != null) {
        updateData.sequencialEdital = sequencialEdital;
      }
      if (cnpj && cnpj != null) {
        updateData.cnpj = cnpj;
      }
      if (ano && ano != null) {
        updateData.ano = ano;
      }

      const edital = await prisma.editalProposta.update({
        where: {
          id,
          propostaId
        },
        data: updateData
      });

      if (!edital) {
        return reply.status(400).send({ message: "Edital not found" });
      }

      reply.send({ message: "Edital created" });
    }
  );
};