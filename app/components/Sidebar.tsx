"use client";

import { useState } from "react";
import Link from "next/link";
import { ProjectForm, DeleteProjectButton } from "./ProjectForm";

interface Project {
  id: string;
  name: string;
  _count: { tasks: number };
}

interface SidebarProps {
  projects: Project[];
}

export function Sidebar({ projects }: SidebarProps) {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="text-lg font-bold text-purple-700">
          📋 Task Manager
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 mb-1"
        >
          🏠 All Tasks
        </Link>

        {/* Projects Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
            <button
              onClick={() => setShowProjectForm(!showProjectForm)}
              className="text-gray-400 hover:text-purple-600 text-lg leading-none"
              title="New project"
            >
              +
            </button>
          </div>

          {showProjectForm && (
            <div className="px-3 pb-3">
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <ProjectForm onClose={() => setShowProjectForm(false)} />
              </div>
            </div>
          )}

          {projects.map((project) => (
            <div key={project.id}>
              {editingProject?.id === project.id ? (
                <div className="px-3 pb-2">
                  <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                    <ProjectForm
                      project={project}
                      onClose={() => setEditingProject(null)}
                    />
                  </div>
                </div>
              ) : (
                <div className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100">
                  <Link
                    href={`/?project=${project.id}`}
                    className="flex-1 text-sm text-gray-700 truncate"
                  >
                    📁 {project.name}
                    <span className="ml-1 text-xs text-gray-400">({project._count.tasks})</span>
                  </Link>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="text-gray-400 hover:text-purple-600 text-xs"
                    >
                      ✏️
                    </button>
                    <DeleteProjectButton
                      projectId={project.id}
                      projectName={project.name}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
