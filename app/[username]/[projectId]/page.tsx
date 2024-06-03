"use client";

import { useQuery } from "convex/react"
import { Header } from "./_components/header"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Offers } from "./_components/offers";
import { Seller } from "./_components/seller";
import { Images } from "../../../components/images";
import { Description } from "@/components/description";
import { Info } from "lucide-react";
import { SellerDetails } from "./_components/seller-details";
import { Reviews } from "../_components/reviews/reviews";
import { AddReview } from "../_components/reviews/add-review";


interface PageProps {
    params: {
        username: string
        projectId: string
    }
}

const ProjectPage = ({
    params
}: PageProps) => {
    const project = useQuery(api.project.get, { id: params.projectId as Id<"projects"> });
    const seller = useQuery(api.users.getUserByUsername, { username: params.username });
    const categoryAndSubcategory = useQuery(api.project.getCategoryAndSubcategory, { projectId: params.projectId as Id<"projects"> });
    const offers = useQuery(api.offers.get, { projectId: params.projectId as Id<"projects"> });
    const reviews = useQuery(api.reviews.getByProject, { projectId: params.projectId as Id<"projects"> });
    const reviewsFull = useQuery(api.reviews.getFullByProject, { projectId: params.projectId as Id<"projects"> });

    if (project === undefined || reviews === undefined || reviewsFull === undefined || categoryAndSubcategory === undefined || offers == undefined) {
        return <div>Loading...</div>
    }

    if (project === null || categoryAndSubcategory === null || offers === null) {
        return <div>Tidak ditemukan</div>
    }

    if (project.published === false) {
        return <div>Project ini tidak dipublikasikan</div>
    }

    const editUrl = `/seller/${project.seller.username}/manage-projects/edit/${project._id}`

    return (
        <div>
            <div className="flex flex-col sm:flex-row w-full sm:justify-center space-x-0 sm:space-x-3 lg:space-x-16">
                <div className="w-full space-y-8">
                    <Header
                        {...categoryAndSubcategory}
                        editUrl={editUrl}
                        ownerId={project.seller._id}
                    />
                    <h1 className="text-3xl font-bold break-words text-[#3F3F3F]">{project.title}</h1>
                    <Seller
                        seller={project.seller}
                        reviews={reviews}
                    />
                    <Images
                        images={project.images}
                        title={project.title}
                        allowDelete={false}
                    />
                    {/* <h2 className="font-semibold">About this project</h2> */}
                    <Description
                        editable={false}
                        initialContent={project.description}
                        projectId={project._id}
                    //className="pb-40 2xl:px-[200px] xl:px-[90px] xs:px-[17px]"
                    />
                    <div className="border border-zinc-400 p-4 space-y-2 rounded-2xl">
                        <div className="flex space-x-2">
                            <Info />
                            <h4>Preferensi pengiriman</h4>
                        </div>
                        <p>Harap sampaikan preferensi atau masalah apa pun terkait preferensi pengiriman Anda.</p>
                    </div>
                    <SellerDetails
                        seller={project.seller}
                        reviews={reviews}
                        lastFulFilmentTime={project.lastFulfillment?.fulfillmentTime}
                    />
                    {/* 
                    <Reviews
                        reviews={reviewsFull}
                    />
                     */}
                    <AddReview
                        projectId={project._id}
                        sellerId={project.seller._id}
                    />
                </div>
                <Offers
                    offers={offers}
                    sellerId={project.seller._id}
                    editUrl={editUrl}
                />
            </div>
        </div>
    )
}

export default ProjectPage