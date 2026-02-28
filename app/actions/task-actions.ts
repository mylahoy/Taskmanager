"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Status, Priority } from "@prisma/client";

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  notes: z.string().optional(),
  status: z.nativeEnum(Status),
  priority: z.nativeEnum(Priority),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

export async function createTask(formData: FormData) {
  const tagIds = formData.getAll("tagIds").map(String);
  const raw = {
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    status: formData.get("status") || "TODO",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate") || null,
    projectId: formData.get("projectId") || null,
    tagIds,
  };

  const data = TaskSchema.parse(raw);

  await prisma.task.create({
    data: {
      title: data.title,
      notes: data.notes,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId || null,
      tags: {
        create: (data.tagIds ?? []).map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/");
}

export async function updateTask(id: string, formData: FormData) {
  const tagIds = formData.getAll("tagIds").map(String);
  const raw = {
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    status: formData.get("status") || "TODO",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate") || null,
    projectId: formData.get("projectId") || null,
    tagIds,
  };

  const data = TaskSchema.parse(raw);

  // Preserve existing completedAt if status stays DONE; set now if newly DONE; null otherwise
  const existing = await prisma.task.findUnique({ where: { id }, select: { status: true, completedAt: true } });
  const completedAt =
    data.status === "DONE"
      ? existing?.status === "DONE"
        ? existing.completedAt
        : new Date()
      : null;

  await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      notes: data.notes,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId || null,
      completedAt,
      tags: {
        deleteMany: {},
        create: (data.tagIds ?? []).map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/");
}

export async function updateTaskStatus(id: string, status: Status) {
  const completedAt = status === "DONE" ? new Date() : null;
  await prisma.task.update({
    where: { id },
    data: { status, completedAt },
  });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}
