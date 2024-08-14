import { prisma } from "../lib/prisma";

async function sendEmailsProposta() {
  const searchAllPropostas = await prisma.emailsProposta.findMany({
    where: {
      isSent: false
    },
    select: {
      id: true
    }
  });

  if (searchAllPropostas.length === 0) {
    return;
  }

};