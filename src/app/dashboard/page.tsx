import { redirect } from "next/navigation";
import { DashboardView } from "@/components/workspace/dashboard-view";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getCurrentUser } from "@/server/auth";
import { getUserDashboard } from "@/server/services/dashboard";
import { loadProjectWorkspace, loadWorkspaceProjects } from "../workspace-data";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const [projects, userDashboard] = await Promise.all([
    loadWorkspaceProjects(currentUser.id),
    getUserDashboard(currentUser.id),
  ]);
  const activeProject = projects[0];
  const activeWorkspace = activeProject ? await loadProjectWorkspace(activeProject.id, currentUser.id) : null;

  return (
    <WorkspaceShell active="dashboard" currentUser={currentUser}>
      <DashboardView
        dashboard={activeWorkspace?.dashboard ?? userDashboard}
        members={activeWorkspace?.members ?? []}
        project={activeWorkspace?.project ?? null}
        projects={projects}
        tasks={activeWorkspace?.tasks ?? []}
      />
    </WorkspaceShell>
  );
}
