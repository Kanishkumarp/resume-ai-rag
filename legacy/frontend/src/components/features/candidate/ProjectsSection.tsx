interface ProjectsSectionProps {
  projects?: Array<{ title: string; description?: string }>;
}

export function ProjectsSection({ projects = [] }: ProjectsSectionProps) {
  if (!projects.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-white">Projects</p>
      <div className="mt-3 space-y-2 text-sm text-slate-300">
        {projects.map((project) => (
          <div key={project.title}>
            <p className="font-medium text-white">{project.title}</p>
            {project.description ? <p className="mt-1 text-slate-400">{project.description}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
