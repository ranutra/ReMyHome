"use client";
import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Images } from "@/components/images"
import Link from "next/link";

interface MyProjectsListProps {
    sellerUsername: string
}

export const MyProjectsList = ({
    sellerUsername
}: MyProjectsListProps) => {
    const projects = useQuery(api.projects.getProjectsWithImages, { sellerUsername: sellerUsername });
    if (projects === undefined) {
        return <div>Loading...</div>
    }

    return (
        <Carousel opts={{
            align: "start",
            loop: true,
            dragFree: false,

        }} className="w-full">
            <CarouselContent>
                {projects.map((project) => (
                    <CarouselItem className="basis-1/3" key={project._id}>
                        <Link href={`/${sellerUsername}/${project._id}`}>
                            <Images
                                images={project.images}
                                title={project.title}
                                allowDelete={false}
                            />
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}