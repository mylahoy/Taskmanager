import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: "project-1" },
    update: {},
    create: {
      id: "project-1",
      name: "Personal",
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: "project-2" },
    update: {},
    create: {
      id: "project-2",
      name: "Work",
    },
  });

  // Create sample tags
  const tagBug = await prisma.tag.upsert({
    where: { name: "bug" },
    update: {},
    create: { name: "bug" },
  });

  const tagFeature = await prisma.tag.upsert({
    where: { name: "feature" },
    update: {},
    create: { name: "feature" },
  });

  const tagUrgent = await prisma.tag.upsert({
    where: { name: "urgent" },
    update: {},
    create: { name: "urgent" },
  });

  // Create sample tasks
  await prisma.task.upsert({
    where: { id: "task-1" },
    update: {},
    create: {
      id: "task-1",
      title: "Set up project structure",
      notes: "Initialize the project with all dependencies",
      status: "DONE",
      priority: "HIGH",
      projectId: project2.id,
      completedAt: new Date(),
      tags: {
        create: [{ tagId: tagFeature.id }],
      },
    },
  });

  await prisma.task.upsert({
    where: { id: "task-2" },
    update: {},
    create: {
      id: "task-2",
      title: "Write unit tests",
      notes: "Cover all critical paths",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      projectId: project2.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: {
        create: [{ tagId: tagFeature.id }],
      },
    },
  });

  await prisma.task.upsert({
    where: { id: "task-3" },
    update: {},
    create: {
      id: "task-3",
      title: "Fix login bug",
      notes: "Users can't log in with special characters in password",
      status: "TODO",
      priority: "HIGH",
      projectId: project2.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      tags: {
        create: [{ tagId: tagBug.id }, { tagId: tagUrgent.id }],
      },
    },
  });

  await prisma.task.upsert({
    where: { id: "task-4" },
    update: {},
    create: {
      id: "task-4",
      title: "Buy groceries",
      status: "TODO",
      priority: "LOW",
      projectId: project1.id,
    },
  });

  await prisma.task.upsert({
    where: { id: "task-5" },
    update: {},
    create: {
      id: "task-5",
      title: "Read book chapter",
      notes: "Continue from chapter 5",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      projectId: project1.id,
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
