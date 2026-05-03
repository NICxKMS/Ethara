import { redirect } from "next/navigation";
import { ProjectsView } from "@/components/workspace/projects-view";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getCurrentUser } from "@/server/auth";
import { loadWorkspaceProjects } from "../workspace-data";

export default async function ProjectsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const projects = await loadWorkspaceProjects(currentUser.id);

  return (
    <WorkspaceShell active="projects" currentUser={currentUser}>
      <ProjectsView projects={projects} />
    </WorkspaceShell>
  );
}
