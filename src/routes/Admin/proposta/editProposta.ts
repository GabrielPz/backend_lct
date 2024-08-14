import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";

interface Proposta {
  title?: string;
  idContratacaoPNCP?: string;
  modalidadeDaContratacao?: string;
  ultimaAtualizacao?: string;
  pncpId?: string;
  orgao?: string;
  local?: string;
  estado?: string;
  objeto?: string;
}

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

const requestBodySchema = z.object({
  title: z.string().optional().nullish(),
  idContratacaoPNCP: z.string().optional().nullish(),
  modalidadeDaContratacao: z.string().optional().nullish(),
  ultimaAtualizacao: z.string().optional().nullish(),
  pncpId: z.string().optional().nullish(),
  orgao: z.string().optional().nullish(),
  local: z.string().optional().nullish(),
  estado: z.string().optional().nullish(),
  objeto: z.string().optional().nullish()
});

export async function editProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/proposta/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Proposta"],
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
      const { id } = requestParamsSchema.parse(request.params);
      const {
        title,
        idContratacaoPNCP,
        modalidadeDaContratacao,
        ultimaAtualizacao,
        pncpId,
        orgao,
        local,
        estado,
        objeto
      } = requestBodySchema.parse(request.body);

      const updateData: Proposta = {};

      if (title && title != null) {
        updateData.title = title;
      }
      if (idContratacaoPNCP && idContratacaoPNCP != null) {
        updateData.idContratacaoPNCP = idContratacaoPNCP;
      }
      if (modalidadeDaContratacao && modalidadeDaContratacao != null) {
        updateData.modalidadeDaContratacao = modalidadeDaContratacao;
      }
      if (ultimaAtualizacao && ultimaAtualizacao != null) {
        updateData.ultimaAtualizacao = ultimaAtualizacao;
      }
      if (orgao && orgao != null) {
        updateData.orgao = orgao;
      }
      if (local && local != null) {
        updateData.local = local;
      }
      if (estado && estado != null) {
        updateData.estado = estado;
      }
      if (objeto && objeto != null) {
        updateData.objeto = objeto;
      }
      if(pncpId && pncpId != null) {
        updateData.pncpId = pncpId;
      }

      const proposta = await prisma.proposta.update({
        where: {
          id: id
        },
        data: updateData
      });

      if (!proposta) {
        return reply.status(400).send({ message: "Erro ao buscar propostas" });
      }

      return reply
        .status(200)
        .send({ message: "Proposta atualizada com sucesso" });
    }
  );
}
