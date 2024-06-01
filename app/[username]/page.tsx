"use client";

import { useQuery } from "convex/react";
import { ProfileCard } from "./_components/profile-card";
import { api } from "@/convex/_generated/api";
import { MyProjectsList } from "./_components/my-projects-list";
import { ReviewsStats } from "./_components/reviews/reviews-stats";
import { Reviews } from "./_components/reviews/reviews";

interface SellerPageProps {
    params: {
        username: string
        projectId: string
    }
}

const SellerPage = ({
    params
}: SellerPageProps) => {
    const seller = useQuery(api.users.getUserByUsername, { username: params.username });
    // const skills = useQuery(api.skills.getByUser, { username: params.username });
    const projects = useQuery(api.projects.getBySellerName, { sellerName: params.username });
    //const orders = useQuery(api.orders.getByProject, { projectId: params.projectId as Id<"projects"> });
    const reviews = useQuery(api.reviews.getBySellerName, { sellerName: params.username });

    if (seller === undefined || reviews === undefined || projects === undefined) {
        return <div>Loading...</div>
    }

    if (seller === null || projects === null) {
        return <div>Not found</div>
    }

    // const skillsString = skills ? skills.map((skill) => skill.skill).join(", ") : "";

    return (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row w-full sm:justify-center p-0 sm:p-6 md:p-16 space-x-0 sm:space-x-3 lg:space-x-16">
                <div className="w-full space-y-8 max-w-[700px]">
                    <ProfileCard
                        seller={seller}
                        reviews={reviews}
                    />
                    <div>
                        <p className="font-bold">About me</p>
                        <p>{seller.about}</p>
                    </div>
                    {/* <div>
                        <p className="font-bold">Skills</p>
                        <p>{skillsString}</p>
                    </div> */}
                </div>
            </div>
            <MyProjectsList
                sellerUsername={params.username}
            />

            <ReviewsStats
                reviews={reviews}
            />
            <Reviews
                reviews={reviews}
            />
        </div>
    )
}
export default SellerPage;