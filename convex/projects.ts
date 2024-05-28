import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
    args: {
        search: v.optional(v.string()),
        favorites: v.optional(v.string()),
        filter: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const title = args.search as string;

        let projects = [];

        if (title) {
            projects = await ctx.db
                .query("projects")
                .withSearchIndex("search_title", (q) =>
                    q
                        .search("title", title)
                )
                .collect();
        } else {
            projects = await ctx.db
                .query("projects")
                .withIndex("by_published", (q) => q.eq("published", true))
                .order("desc")
                .collect();
        }

        // check if there is filter
        if (args.filter !== undefined) {
            const filter = args.filter as string;
            // get subcategory by name
            const subcategory = await ctx.db
                .query("subcategories")
                .withIndex("by_name", (q) => q.eq("name", filter))
                .unique();

            const filteredProjects = projects.filter((project) => project.subcategoryId === subcategory?._id);
            projects = filteredProjects;
        }

        let projectsWithFavoriteRelation = projects;

        if (identity !== null) {
            projectsWithFavoriteRelation = await Promise.all(projects.map((project) => {
                return ctx.db
                    .query("userFavorites")
                    .withIndex("by_user_project", (q) =>
                        q
                            .eq("userId", project.sellerId)
                            .eq("projectId", project._id)
                    )
                    .unique()
                    .then((favorite) => {
                        console.log("favorite: ", favorite);
                        return {
                            ...project,
                            favorited: !!favorite,
                        };
                    });
            }));
        }

        //const projectsWithFavorite = await Promise.all(projectsWithFavoriteRelation);


        const projectsWithImages = await Promise.all(projectsWithFavoriteRelation.map(async (project) => {
            const image = await ctx.db
                .query("projectMedia")
                .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
                .first();

            const seller = await ctx.db.query("users")
                .filter((q) => q.eq(q.field("_id"), project.sellerId))
                .unique();

            if (!seller) {
                throw new Error("Seller not found");
            }

            const reviews = await ctx.db.query("reviews")
                .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
                .collect();

            const offer = await ctx.db.query("offers")
                .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
                .first();

            return {
                ...project,
                storageId: image?.storageId,
                seller,
                reviews,
                offer
            };
        }));

        return projectsWithImages;
    },
});


export const getBySellerName = query({
    args: {
        sellerName: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.sellerName))
            .unique();

        if (!user) {
            return null;
        }

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_sellerId", (q) => q.eq("sellerId", user._id))
            .collect();

        return projects;
    },
});


export const getProjectsWithImages = query({
    args: { sellerUsername: v.string() },
    handler: async (ctx, args) => {

        const seller = await ctx.db.query("users")
            .withIndex("by_username", (q) => q.eq("username", args.sellerUsername))
            .unique();

        if (seller === null) {
            throw new Error("Seller not found");
        }

        const projects = await ctx.db.query("projects")
            .withIndex("by_sellerId", (q) => q.eq("sellerId", seller._id))
            .collect();

        if (projects === null) {
            throw new Error("Projects not found");
        }

        const projectsWithImages = await Promise.all(projects.map(async (project) => {

            // get images
            const images = await ctx.db.query("projectMedia")
                .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
                .collect();

            const imagesWithUrls = await Promise.all(images.map(async (image) => {
                const imageUrl = await ctx.storage.getUrl(image.storageId);
                if (!imageUrl) {
                    throw new Error("Image not found");
                }
                return { ...image, url: imageUrl };
            }));

            const projectWithImages = {
                ...project,
                images: imagesWithUrls,
            };

            return projectWithImages;
        }));

        return projectsWithImages;
    },
});



export const getProjectsWithOrderAmountAndRevenue = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) {
            throw new Error("Couldn't authenticate user");
        }

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_sellerId", (q) => q.eq("sellerId", user._id))
            .order("desc")
            .collect();

        const projectsWithOrderAmount = await Promise.all(
            projects.map(async (project) => {
                const orders = await ctx.db
                    .query("orders")
                    .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
                    .collect();

                const orderAmount = orders.length;

                return {
                    ...project,
                    orderAmount,
                };
            })
        );

        const projectsWithOrderAmountAndRevenue = await Promise.all(
            projectsWithOrderAmount.map(async (project) => {
                const offers = await ctx.db
                    .query("offers")
                    .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
                    .collect();

                const totalRevenue = offers.reduce((acc, offer) => acc + offer.price, 0);

                return {
                    ...project,
                    totalRevenue,
                };
            })
        );

        // get images
        const projectsFull = await Promise.all(projectsWithOrderAmountAndRevenue.map(async (project) => {
            const image = await ctx.db
                .query("projectMedia")
                .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
                .first();

            if (image) {
                const url = await ctx.storage.getUrl(image.storageId);
                return {
                    ...project,
                    ImageUrl: url
                };
            }
            return {
                ...project,
                ImageUrl: null
            };
        }));




        return projectsFull
    },
});