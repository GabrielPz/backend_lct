import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";
import { transporter } from "../../../services/nodeMailer";
import { generateNumericCode } from "../../../utils/generateCode";

export const enviarEmail = ({
  email,
  code,
  name
}: {
  email: string;
  code: string;
  name: string;
}) => {
  transporter.sendMail(
    {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Código de login",
      text: `Olá ${name} sua chave de acesso é: ${code}, validade de 3 horas.`
    },
    (error: Error, info: any) => {
      if (error) {
        // console.error(error);
      } else {
        // console.log("Chave secreta 2FA enviada com sucesso: " + info.response);
      }
    }
  );
  console.log(`Chave secreta 2FA enviada para ${email}: ${code}`);
};

export async function sendCodeLogin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fornecedor/:id/send-code",
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

      const fornecedor = await prisma.fornecedor.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          email: true,
          nome: true
        }
      });

      if (!fornecedor) {
        return reply.status(400).send({ message: "Fornecedor not found" });
      }

      const code = generateNumericCode();

      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() + 3);

      const updateCode = await prisma.aprovacaoLoginFornecedor.upsert({
        where: {
          fornecedorId: fornecedor.id
        },
        update: {
          token: code,
          expireAt: dataAtual
        },
        create: {
          token: code,
          fornecedorId: fornecedor.id,
          expireAt: dataAtual
        }
      });

      if(!updateCode) {
        return reply.send({ message: "Error to send code" });
      }

      enviarEmail({ email: fornecedor.email, code, name: fornecedor.email });

      return reply.send({ message: "Check fornecedor" });
    }
  );
}
