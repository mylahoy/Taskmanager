import { prisma } from "@/lib/db";
import { TaskItem } from "@/app/components/TaskItem";
import { TaskForm } from "@/app/components/TaskForm";
import { Filters } from "@/app/components/Filters";
import { Suspense } from "react";
import { Status, Priority } from "@prisma/client";

interface SearchParams {
  project?: string;
  status?: string;
  tag?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { project, status, tag, search, sortBy = "createdAt", sortDir = "desc" } = params;

  // Build filter conditions
  const where: Record<string, unknown> = {};

  if (project) where.projectId = project;
  if (status && ["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
    where.status = status as Status;
  }
  if (tag) {
    where.tags = { some: { tagId: tag } };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  // Validate sort options
  const validSortFields = ["createdAt", "dueDate", "priority", "title", "updatedAt"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortDirection = sortDir === "asc" ? "asc" : "desc";

  // Priority sort needs special handling since it's an enum
  type OrderByItem = Record<string, string>;
  let orderBy: OrderByItem[];
  if (sortField === "priority") {
    // HIGH > MEDIUM > LOW
    orderBy = [
      { priority: sortDirection === "asc" ? "asc" : "desc" },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = [
      { [sortField]: sortDirection },
      { createdAt: "desc" },
    ];
  }

  const [tasks, projects, allTags] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      include: {
        tags: { include: { tag: true } },
        project: true,
      },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const projectsWithCount = await prisma.project.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tasks: true } } },
  });

  const currentProject = project ? projects.find((p) => p.id === project) : null;
  const currentTag = tag ? allTags.find((t) => t.id === tag) : null;

  const pageTitle = currentProject
    ? currentProject.name
    : currentTag
      ? `#${currentTag.name}`
      : status === "TODO"
        ? "To Do"
        : status === "IN_PROGRESS"
          ? "In Progress"
          : status === "DONE"
            ? "Done"
            : "All Tasks";

  return (
    <div className="flex h-screen">
      {/* Filter Sidebar */}
      <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto py-4">
        <Suspense fallback={<div className="px-3 text-sm text-gray-400">Loading...</div>}>
          <Filters projects={projectsWithCount} tags={allTags} />
        </Suspense>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <SearchBar defaultValue={search} />
          <SortControls sortBy={sortBy} sortDir={sortDir} />
        </div>

        {/* New Task Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">+ New Task</h2>
          <TaskForm
            projects={projects}
            allTags={allTags}
            defaultProjectId={project}
          />
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">✓</p>
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm">Create a new task above to get started.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                allTags={allTags}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form method="GET" className="flex-1 min-w-0">
      <input
        type="search"
        name="search"
        defaultValue={defaultValue}
        placeholder="Search tasks by title or notes..."
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </form>
  );
}

function SortControls({ sortBy, sortDir }: { sortBy: string; sortDir: string }) {
  return (
    <form method="GET" className="flex gap-2">
      <select
        name="sortBy"
        defaultValue={sortBy}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none"
      >
        <option value="createdAt">Created Date</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
        <option value="updatedAt">Updated Date</option>
      </select>
      <select
        name="sortDir"
        defaultValue={sortDir}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none"
      >
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>
      <button
        type="submit"
        className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
      >
        Sort
      </button>
    </form>
  );
}
