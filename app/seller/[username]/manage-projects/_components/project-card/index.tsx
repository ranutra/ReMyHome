import { Doc } from "@/convex/_generated/dataModel";

interface ProjectCardProps {
    project: Doc<"projects">;
}

export const ProjectCard = ({
    project
}: ProjectCardProps) => {
    return (
        <div>
            {project.title}
        </div>
    )
}