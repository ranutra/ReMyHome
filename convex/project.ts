import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
      title: v.string(),
      description: v.string(),
      subcategoryId: v.string(),
  },
  handler: async (ctx, args) => {
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

      if (user === null) {
          return;
      }

      const projectId = await ctx.db.insert("projects", {
          title: args.title,
          description: args.description,
          subcategoryId: args.subcategoryId as Id<"subcategories">,
          sellerId: user._id!,
          published: false,
          clicks: 0,
      })

      return projectId;
  },
});

export const get = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (project === null) {
            throw new Error("Project tidak ditemukan.");
        }
        const seller = await ctx.db.get(project.sellerId as Id<"users">);

        if (!seller) {
            throw new Error("Seller not found");
        }

        // const country = await ctx.db.query("countries")
        //     .withIndex("by_userId", (q) => q.eq("userId", seller._id))
        //     .unique();

        // if (country === null) {
        //     throw new Error("Country not found");
        // }

        // // get languages
        // const languages = await ctx.db.query("languages")
        //     .withIndex("by_userId", (q) => q.eq("userId", seller._id))
        //     .collect();

        const sellerWithCountryAndLanguages = {
            ...seller,
            // country: country,
            // languages: languages,
        };

        const projectWithSeller = {
            ...project,
            seller: sellerWithCountryAndLanguages
        };

        // get last fulfillment
        const lastFulfillment = await ctx.db.query("orders")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .order("desc")
            .first();


        const projectWithSellerAndLastFulfillment = {
            ...projectWithSeller,
            lastFulfillment: lastFulfillment,
        };


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

        const projectWithSellerAndLastFulfillmentAndImages = {
            ...projectWithSellerAndLastFulfillment,
            images: imagesWithUrls,
        };

        return projectWithSellerAndLastFulfillmentAndImages;
    },
});

export const isPublished = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        return project?.published || false;
    }
});

export const publish = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) {
            throw new Error("Project tidak ditemukan");
        }

        const media = await ctx.db.query("projectMedia")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .collect();

        const offers = await ctx.db.query("offers")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .collect();

        if (media.length === 0 || project.description === "" || offers.length !== 3) {
            throw new Error("project needs at least one image to be published");
        }

        await ctx.db.patch(args.id, {
            published: true,
        });

        return project;
    },
});

export const unpublish = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);

        if (!project) {
            throw new Error("project not found");
        }

        await ctx.db.patch(args.id, {
            published: false,
        });

        return project;
    },
});

export const remove = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
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

        if (user === null) {
            return;
        }

        //const userId = identity.subject as Id<"users">;
        const userId = user._id;
        const existingFavorite = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_project", (q) =>
                q
                    .eq("userId", userId)
                    .eq("projectId", args.id)
            )
            .unique();

        if (existingFavorite) {
            await ctx.db.delete(existingFavorite._id);
        }

        await ctx.db.delete(args.id);
    },
});

export const updateDescription = mutation({
    args: { id: v.id("projects"), description: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const description = args.description.trim();

        if (!description) {
            throw new Error("Description is required");
        }

        if (description.length > 20000) {
            throw new Error("Description is too long!")
        }

        const project = await ctx.db.patch(args.id, {
            description: args.description,
        });

        return project;
    },
});

export const update = mutation({
    args: { id: v.id("projects"), title: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const title = args.title.trim();

        if (!title) {
            throw new Error("Title is required");
        }

        if (title.length > 60) {
            throw new Error("Title cannot be longer than 60 characters")
        }

        const project = await ctx.db.patch(args.id, {
            title: args.title,
        });

        return project;
    },
});

export const favorite = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const project = await ctx.db.get(args.id);

        if (!project) {
            throw new Error("Board not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user === null) {
            return;
        }

        const userId = user._id;

        const existingFavorite = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_project", (q) =>
                q
                    .eq("userId", userId)
                    .eq("projectId", project._id)
            )
            .unique();

        if (existingFavorite) {
            throw new Error("Board already favorited");
        }

        await ctx.db.insert("userFavorites", {
            userId,
            projectId: project._id,
        });

        return project;
    },
});

export const unfavorite = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const project = await ctx.db.get(args.id);

        if (!project) {
            throw new Error("Board not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user === null) {
            return;
        }

        const userId = user._id;

        const existingFavorite = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_project", (q) =>
                q
                    .eq("userId", userId)
                    .eq("projectId", project._id)
            )
            .unique();

        if (!existingFavorite) {
            throw new Error("Favorited project not found");
        }

        await ctx.db.delete(existingFavorite._id);

        return project;
    },
});

export const getSeller = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const seller = ctx.db.get(args.id);
        return seller;
    },
});

export const getCategoryAndSubcategory = query({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);

        if (!project) {
            throw new Error("project not found");
        }

        const subcategory = await ctx.db.get(project.subcategoryId);

        if (!subcategory) {
            throw new Error("Subcategory not found");
        }

        const category = await ctx.db.get(subcategory.categoryId);
        if (!category) {
            throw new Error("Category not found");
        }

        return {
            category: category.name,
            subcategory: subcategory.name,
        };
    }
});