import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { storage } from "../../../services/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import multer from "multer";
import { MultipartFile } from "@fastify/multipart";
import { autenticarToken } from "./login";
const upload = multer({ storage: multer.memoryStorage() });

async function uploadFileAndGetURL(file: any): Promise<string> {
  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "image/jpg"
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only PNG, JPEG, JPG and PDF are accepted."
    );
  }

  const randomFilename = crypto.randomUUID();
  const storageRef = ref(storage, `profilePhotos/${randomFilename}`);

  try {
    await uploadBytes(storageRef, await file.toBuffer(), {
      contentType: file.mimetype
    });
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
}

export async function profilePhotoUserAdmin(app: FastifyInstance) {
  app.register(require("@fastify/multipart"), {
    limits: {
      fileSize: 5242880 // 5MB
    }
  });
  app.withTypeProvider<ZodTypeProvider>().put(
    "/user/:id/profile-photo",
    {
      schema: {
        preHandler: [autenticarToken, upload.single("profilePhoto")],
        summary:
          "Edit User Profile Photo - Envia o profilePhoto atráves do MultPartForm",
        description: "Envia o profilePhoto atráves do MultPartForm",
        tags: ["User"],
        consumes: ["multipart/form-data"],
        params: z.object({
          id: z.string().uuid()
        }),
        headers: z.object({
          authorization: z.string()
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
      const { id } = request.params;

      try {
        const searchUser = await prisma.user.findUnique({
          where: {
            id
          },
          select: {
            id: true,
            nome: true,
            profilePhoto: true
          }
        });

        if (!searchUser) {
          return reply.status(404).send({ message: "User not found" });
        }

        const file = (await (request as any).file()) as MultipartFile;

        if (!file) {
          return reply.status(400).send({ message: "File not found" });
        }

        const profilePhoto = await uploadFileAndGetURL(file);

        if (searchUser.profilePhoto) {
          const storageRef = ref(storage, `${searchUser.profilePhoto}`);
          await deleteObject(storageRef);
        }

        const user = await prisma.user.update({
          where: {
            id
          },
          data: {
            profilePhoto
          }
        });

        if (!user) {
          return reply.status(404).send({ message: "User not found" });
        }

        return reply
          .status(200)
          .send({ message: "User profile photo updated" });
      } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error" });
      }
    }
  );
}
