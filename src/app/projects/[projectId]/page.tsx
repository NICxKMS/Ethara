import { notFound, redirect } from "next/navigation";
import { DashboardView } from "@/components/workspace/dashboard-view";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getCurrentUser } from "@/server/auth";
import { routeIdSchema } from "@/server/validation";
import { loadProjectWorkspace, loadWorkspaceProjects } from "../../workspace-data";

export interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: Readonly<ProjectDetailPageProps>) {
  const { projectId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!routeIdSchema.safeParse(projectId).success) {
    notFound();
  }

  const projects = await loadWorkspaceProjects(currentUser.id);
  const workspace = await loadProject(projectId, currentUser.id);
  const canManageMembers = workspace.members.some((member) => member.userId === currentUser.id && member.role === "admin");

  return (
    <WorkspaceShell active="projects" currentUser={currentUser}>
      <DashboardView
        canManageMembers={canManageMembers}
        dashboard={workspace.dashboard}
        members={workspace.members}
        project={workspace.project}
        projects={projects}
        tasks={workspace.tasks}
      />
    </WorkspaceShell>
  );
}

async function loadProject(projectId: string, userId: string) {
  try {
    return await loadProjectWorkspace(projectId, userId);
  } catch (error) {
    if (error instanceof Error && (error.message === "Project member access is required" || error.message === "Project not found")) {
      notFound();
    }

    throw error;
  }
}
