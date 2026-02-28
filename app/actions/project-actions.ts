"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
});

export async function createProject(formData: FormData) {
  const raw = { name: formData.get("name") };
  const data = ProjectSchema.parse(raw);

  await prisma.project.create({ data });
  revalidatePath("/");
}

export async function updateProject(id: string, formData: FormData) {
  const raw = { name: formData.get("name") };
  const data = ProjectSchema.parse(raw);

  await prisma.project.update({ where: { id }, data });
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
}
