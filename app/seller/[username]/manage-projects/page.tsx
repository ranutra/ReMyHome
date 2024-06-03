"use client";

import Link from "next/link";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

import { ProjectList } from "./_components/project-list";
import { Separator } from "@/components/ui/separator";

import { ProjectData, columns } from "./_components/columns";
import { Loading } from "@/components/auth/loading";
import { DataTable } from "./_components/data-table";


const ManageProjects = () => {
    const currentUser = useQuery(api.users.getCurrentUser);
    const projects = useQuery(api.projects.getProjectsWithOrderAmountAndRevenue);

    if (projects === undefined || currentUser === undefined) {
        return <Loading />
    }

    if (projects === null || currentUser === null) {
        return <div>Tidak ditemukan</div>
    }

    const data: ProjectData[] = projects.map(project => ({
        id: project._id,
        title: project.title,
        image: project.ImageUrl || "https://images.unsplash.com/photo-1559311648-d46f5d8593d6?q=80&w=2050&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        clicks: project.clicks,
        orders: project.orderAmount,
        revenue: project.totalRevenue,
        username: currentUser.username
    }));

    return (
        <>
            <div className="flex items-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-semibold">Projects</h1>
                    <p className="text-muted-foreground">
                        Kelola, buat, dan edit proyek dan penawaran Anda.
                    </p>
                </div>
                <Button className="ml-auto" variant={"green"}>
                    <Link href={`/seller/${currentUser?.username}/manage-projects/create`}>Buat</Link>
                </Button>
            </div>
            <Separator className="my-6" />
            <DataTable columns={columns} data={data} />
        </>
    )
}

export default ManageProjects;