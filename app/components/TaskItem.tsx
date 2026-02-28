"use client";

import { useState } from "react";
import { createTag } from "@/app/actions/tag-actions";
import { updateTask, deleteTask, updateTaskStatus } from "@/app/actions/task-actions";
import { Status, Priority } from "@prisma/client";

interface Tag {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  notes: string | null;
  status: Status;
  priority: Priority;
  dueDate: Date | null;
  completedAt: Date | null;
  projectId: string | null;
  tags: { tag: Tag }[];
}

interface TaskItemProps {
  task: Task;
  projects: Project[];
  allTags: Tag[];
}

const STATUS_LABELS: Record<Status, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_COLORS: Record<Status, string> = {
  TODO: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "text-gray-500",
  MEDIUM: "text-yellow-600",
  HIGH: "text-red-600",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export function TaskItem({ task, projects, allTags }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(status: Status) {
    setLoading(true);
    try {
      await updateTaskStatus(task.id, status);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    setLoading(true);
    try {
      await deleteTask(task.id);
    } finally {
      setLoading(false);
    }
  }

  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      className={`bg-white border rounded-lg p-4 shadow-sm ${task.status === "DONE" ? "opacity-70" : ""}`}
    >
      {editing ? (
        <TaskEditForm
          task={task}
          projects={projects}
          allTags={allTags}
          onClose={() => setEditing(false)}
        />
      ) : (
        <div className="flex items-start gap-3">
          {/* Status cycle button */}
          <button
            onClick={() => {
              const next: Record<Status, Status> = {
                TODO: "IN_PROGRESS",
                IN_PROGRESS: "DONE",
                DONE: "TODO",
              };
              handleStatusChange(next[task.status]);
            }}
            disabled={loading}
            className="mt-1 w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center flex-shrink-0 hover:border-purple-500"
            title="Click to advance status"
          >
            {task.status === "DONE" && (
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {task.status === "IN_PROGRESS" && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-gray-400" : ""}`}
              >
                {task.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                {STATUS_LABELS[task.status]}
              </span>
              <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                ↑ {PRIORITY_LABELS[task.priority]}
              </span>
            </div>

            {task.notes && (
              <p className="text-xs text-gray-500 mt-1 truncate">{task.notes}</p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {task.dueDate && (
                <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                  {isOverdue && " (overdue)"}
                </span>
              )}
              {task.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {task.tags.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as Status)}
              disabled={loading}
              className="text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <button
              onClick={() => setEditing(true)}
              className="text-gray-400 hover:text-purple-600 text-sm"
              title="Edit task"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-gray-400 hover:text-red-500 text-sm disabled:opacity-50"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskEditFormProps {
  task: Task;
  projects: Project[];
  allTags: Tag[];
  onClose: () => void;
}

function TaskEditForm({ task, projects, allTags, onClose }: TaskEditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [status, setStatus] = useState<Status>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [projectId, setProjectId] = useState(task.projectId ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    task.tags.map(({ tag }) => tag.id)
  );
  const [newTagName, setNewTagName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("notes", notes);
      fd.append("status", status);
      fd.append("priority", priority);
      fd.append("dueDate", dueDate);
      fd.append("projectId", projectId);
      selectedTagIds.forEach((id) => fd.append("tagIds", id));
      await updateTask(task.id, fd);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTag() {
    const name = newTagName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    try {
      const tag = await createTag(name);
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setNewTagName("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTagIds((prev) =>
                    prev.includes(tag.id)
                      ? prev.filter((id) => id !== tag.id)
                      : [...prev, tag.id]
                  )
                }
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="new-tag"
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateTag}
              className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              + Add Tag
            </button>
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
