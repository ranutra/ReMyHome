"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { EmptySearch } from "./empty-search";
import { EmptyFavorites } from "./empty-favorites";
import { ProjectCard } from "./project-card";
import { Loading } from "@/components/auth/loading";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FullProjectType } from "@/types";
import { useEffect, useState } from "react";

interface ProjectListProps {
    query: {
        search?: string;
        favorites?: string;
        filter?: string;
    };
};

export const ProjectList = ({
    query,
}: ProjectListProps) => {
    const projects: FullProjectType[] | undefined = useQuery(api.projects.get, { search: query.search, favorites: query.favorites, filter: query.filter });
    const [projectsWithFavorite, setProjectsWithFavorite] = useState<FullProjectType[] | undefined>(undefined);
    // filter for favorites if query.favorites is true
    useEffect(() => {
        if (query.favorites) {
            const favoriteProjects = projects?.filter((project) => project.favorited);
            setProjectsWithFavorite(favoriteProjects);
        } else {
            setProjectsWithFavorite(projects);
        }
    }, [query.favorites, projects]);

    if (projects === undefined) {
        return (
            <>Loading Projects...</>
        )
    }

    if (!projects?.length && query.search) {
        return (
            <EmptySearch />
        )
    }

    if (!projectsWithFavorite?.length && query.favorites) {
        return (
            <EmptyFavorites />
        )
    }


    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-8 pb-10 mx-10">
                {projectsWithFavorite?.map((project) => (
                    <ProjectCard
                        key={project._id}
                        id={project._id}
                        sellerId={project.sellerId}
                        title={project.title}
                        description={project.description}
                        createdAt={project._creationTime}
                        isFavorite={project.favorited}
                        storageId={project.storageId}
                        offer={project.offer}
                        reviews={project.reviews}
                    />
                ))
                }
            </div>
        </div>
    )
}