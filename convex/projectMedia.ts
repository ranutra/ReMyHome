import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const sendImage = mutation({
    args: { storageId: v.id("_storage"), format: v.string(), projectId: v.id("projects") },
    handler: async (ctx, args) => {
        // check how many images are already uploaded
        const projectMedia = await ctx.db
            .query("projectMedia")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        if (projectMedia.length >= 5) {
            throw new Error("You can upload up to 5 media files. Please delete a media file before uploading a new one.");
        }

        await ctx.db.insert("projectMedia", {
            storageId: args.storageId,
            format: args.format,
            projectId: args.projectId
        });
    },
});

export const remove = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const media = await ctx.db.query("projectMedia")
            .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
            .unique();

        if (!media) {
            throw new Error("Media not found");
        }

        await ctx.db.delete(media._id);

        await ctx.storage.delete(args.storageId);
    },
});


export const getMediaUrl = query({
    args: { storageId: v.optional(v.id("_storage")) },
    handler: async (ctx, args) => {
        if (!args.storageId) return null;
        return await ctx.storage.getUrl(args.storageId);
    },
});