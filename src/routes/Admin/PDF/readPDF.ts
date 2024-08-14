import { FastifyInstance } from "fastify";
import pdfParse from "pdf-parse";
import fastifyMultipart from "@fastify/multipart";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";

export async function ReadPDF(app: FastifyInstance) {
  // Register the multipart plugin
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 20842880 // 20MB
    }
  });

  app.withTypeProvider<ZodTypeProvider>().post(
    "/pdf/:pncpId",
    {
      schema: {
        consumes: ["multipart/form-data"],
        params: z.object({
          pncpId: z.string()
        }),
        response: {
          200: z.object({
            message: z.string()
          }),
          400: z.object({
            message: z.string()
          }),
          500: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { pncpId } = request.params;

      const extractEmails = (text: string): string[] => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = text.match(emailRegex) || [];
        // Remove extra punctuation at the end of emails
        return emails.map((email) => email.replace(/[.,;:!?]+$/, ""));
      };

      try {
        const parts = request.files();
        let fileBuffer: Buffer | undefined;

        for await (const part of parts) {
          if (part.type === "file" && part.filename) {
            fileBuffer = await part.toBuffer();
            break;
          }
        }

        if (!fileBuffer) {
          return reply
            .status(400)
            .send({ message: "Nenhum arquivo fornecido" });
        }

        const data = await pdfParse(fileBuffer);

        // Extracting and removing duplicate emails
        const emails = extractEmails(data.text);
        const uniqueEmails = Array.from(new Set(emails));
        // console.log("emails: ", uniqueEmails);
        // return reply.send({ emails: uniqueEmails });

        const searchProposta = await prisma.proposta.findFirst({
          where: {
            pncpId
            },
            select: {
              id: true
            }
            });

        if (!searchProposta) {
          return reply.status(400).send({ message: "Proposta não encontrada" });
        }

        const createEmailsProposta = await prisma.emailsProposta.createMany({
          data: uniqueEmails.map((email) => ({
            email,
            propostaId: searchProposta.id
          }))
        });

        if (!createEmailsProposta) {
          return reply
            .status(400)
            .send({ message: "Erro ao criar emails da proposta" });
        }

        return reply
          .status(200)
          .send({ message: "Emails da proposta criados com sucesso" });
      } catch (error) {
        console.error("Erro ao processar o PDF:", error);
        return reply.status(500).send({ message: "Erro ao processar o PDF" });
      }
    }
  );
}
