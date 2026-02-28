"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const TagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Tag name must be lowercase alphanumeric with hyphens"),
});

export async function createTag(name: string) {
  const data = TagSchema.parse({ name });

  const tag = await prisma.tag.upsert({
    where: { name: data.name },
    update: {},
    create: { name: data.name },
  });

  revalidatePath("/");
  return tag;
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/");
}
