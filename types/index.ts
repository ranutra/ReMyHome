import { Doc, Id } from "@/convex/_generated/dataModel";

export type ImageWithUrlType = Doc<"projectMedia"> & {
    url: string
};

export type FullProjectType = Doc<"projects"> & {
    storageId?: Id<"_storage"> | undefined;
    favorited: boolean;
    offer: Doc<"offers">;
    reviews: Doc<"reviews">[];
    seller: Doc<"users">;
}

export type MessageWithUserType = Doc<"messages"> & {
    user: Doc<"users">
};

export type projectWithImageType = Doc<"projects"> & {
    images: Doc<"projectMedia">[]
};


export type UserWithCountryType = Doc<"users"> 
// & {
//     country: Doc<"countries">
// };

export type ReviewFullType = Doc<"reviews"> & {
    author: UserWithCountryType
    image: ImageWithUrlType
    offers: Doc<"offers">[]
    project: Doc<"projects">
};

export type CategoriesFullType = Doc<"categories"> & {

};