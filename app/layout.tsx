import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/app/components/Sidebar";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "A simple task manager built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <Sidebar projects={projects} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
