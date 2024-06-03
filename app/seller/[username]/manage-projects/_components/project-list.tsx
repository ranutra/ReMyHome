"use client";

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { ProjectCard } from "./project-card";

export const ProjectList = () => {
    const projects = useQuery(api.projects.get, {});
    return (
        <>
            {projects?.map((project) => (
                <ProjectCard
                    key={project._id}
                    project={project}
                />
            ))}
        </>
    )
}