"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface Tag {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  _count: { tasks: number };
}

interface FiltersProps {
  projects: Project[];
  tags: Tag[];
}

export function Filters({ projects, tags }: FiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    return `${pathname}?${params.toString()}`;
  }

  const currentProject = searchParams.get("project") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  return (
    <div className="flex flex-col gap-1">
      {/* Status filter */}
      <div className="px-3 py-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
        {[
          { label: "All Tasks", value: "" },
          { label: "To Do", value: "TODO" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Done", value: "DONE" },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={buildHref({ status: value, project: null, tag: null })}
            className={`block px-2 py-1.5 rounded text-sm ${
              currentStatus === value && !currentProject && !currentTag
                ? "bg-purple-100 text-purple-800 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="px-3 py-1 mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Projects</p>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={buildHref({ project: project.id, status: null, tag: null })}
              className={`flex items-center justify-between px-2 py-1.5 rounded text-sm ${
                currentProject === project.id
                  ? "bg-purple-100 text-purple-800 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="truncate">{project.name}</span>
              <span className="text-xs text-gray-400 ml-1">{project._count.tasks}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 py-1 mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={buildHref({ tag: tag.id, project: null, status: null })}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  currentTag === tag.id
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                }`}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
