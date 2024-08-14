import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import speakeasy from "speakeasy";
import { transporter } from "../../../services/nodeMailer";

const requestBodySchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase()),
  option: z.number().refine((val) => val === 1 || val === 2)
});

export const enviarEmail = ({email, code, name} : {email: string, code: string, name: string}) => {
  transporter.sendMail(
    {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Código de recuperação da senha",
      text: `Olá ${name} sua chave secreta é: ${code}, validade de 3 horas.`
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

export async function forgotPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/forgot-password",
    {
      schema: {
        summary: "Forgot Password",
        tags: ["Forgot Password"],
        description: "Option 1: User Admin, Option 2: Fornecedor",
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
      const { email, option } = requestBodySchema.parse(request.body);

      const secret = speakeasy.generateSecret({ length: 6 });
      const code = secret.base32;

      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() + 3);

      switch (option) {
        case 1:
          const user = await prisma.user.findUnique({
            where: {
              email
            },
            select: {
              id: true,
              email: true
            }
          });

          if (!user) {
            return reply.status(400).send({ message: "User not found" });
          }

          const updateCode = await prisma.forgotPassword.upsert({
            where: {
              userId: user.id
            },
            update: {
              token: code,
              expireAt: dataAtual
            },
            create: {
              userId: user.id,
              token: code,
              expireAt: dataAtual
            }
          });

          if (!updateCode) {
            return reply.status(400).send({ message: "Code not created" });
          }

          enviarEmail({ email: email, code: code, name: user.email });

          break;

        case 2:
          const userFornecedor = await prisma.fornecedor.findUnique({
            where: {
              email
            },
            select: {
              id: true,
              email: true
            }
          });

          if (!userFornecedor) {
            return reply.status(400).send({ message: "User not found" });
          }

          const updateCodeFornecedor = await prisma.forgotPassword.upsert({
            where: {
              fornecedorId: userFornecedor.id
            },
            update: {
              token: code,
              expireAt: dataAtual
            },
            create: {
              fornecedorId: userFornecedor.id,
              token: code,
              expireAt: dataAtual
            }
          });

          if (!updateCodeFornecedor) {
            return reply.status(400).send({ message: "Code not created" });
          }

          enviarEmail({ email: email, code: code, name: userFornecedor.email });
          break;
      }

      return { message: "Email sent" };
    }
  );
};