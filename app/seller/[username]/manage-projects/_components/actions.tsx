import React from 'react';
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Id } from '@/convex/_generated/dataModel';

interface ProjectActionsCellProps {
    projectId: Id<"projects">;
    username: string;
}

const ProjectActionsCell = ({ projectId, username }: ProjectActionsCellProps) => {
    const {
        mutate: remove,
        pending: removePending,
    } = useApiMutation(api.project.remove);

    const handleDelete = () => {
        console.log("Hapus", projectId)
        remove({ id: projectId });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Buka menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Link href={`/seller/${username}/manage-projects/edit/${projectId}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                >
                    <Link href={`/${username}/${projectId}`}>Preview</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>Hapus</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ProjectActionsCell;