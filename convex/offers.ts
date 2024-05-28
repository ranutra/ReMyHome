import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const get = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const offers = await ctx.db
            .query("offers")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
        return offers;
    },
});


export const add = action({
    args: {
        projectId: v.id("projects"),
        title: v.string(),
        description: v.string(),
        tier: v.union(v.literal("Basic"), v.literal("Standard"), v.literal("Premium")),
        price: v.number(),
        delivery_days: v.number(),
        revisions: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }
        const offer = await ctx.runQuery(internal.offers.getOffer, { projectId: args.projectId, tier: args.tier });

        if (!offer) {
            const stripePrice = await ctx.runAction(internal.stripe.addPrice, {
                price: args.price,
                tier: args.tier,
                title: args.title,
            });

            await ctx.runMutation(internal.offers.insert, {
                projectId: args.projectId,
                title: args.title,
                description: args.description,
                tier: args.tier,
                price: args.price,
                delivery_days: args.delivery_days,
                revisions: args.revisions,
                stripePriceId: stripePrice.id,
            });

            return "success";
        }
        else {

            await ctx.runMutation(internal.offers.update, {
                projectId: args.projectId,
                title: args.title,
                description: args.description,
                price: args.price,
                delivery_days: args.delivery_days,
                revisions: args.revisions,
                offerId: offer._id,
            });
            return "success";
        }
    }
});



export const insert = internalMutation({
    args: {
        projectId: v.id("projects"),
        title: v.string(),
        description: v.string(),
        tier: v.union(v.literal("Basic"), v.literal("Standard"), v.literal("Premium")),
        price: v.number(),
        delivery_days: v.number(),
        revisions: v.number(),
        stripePriceId: v.string(),
    },
    handler: async (ctx, args) => {
        const offerId = await ctx.db.insert("offers", {
            projectId: args.projectId,
            title: args.title,
            description: args.description,
            tier: args.tier,
            price: args.price,
            delivery_days: args.delivery_days,
            revisions: args.revisions,
            stripePriceId: args.stripePriceId,
        });
        return offerId;
    }

});

export const update = internalMutation({
    args: {
        projectId: v.id("projects"),
        title: v.string(),
        description: v.string(),
        price: v.number(),
        delivery_days: v.number(),
        revisions: v.number(),
        offerId: v.id("offers"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.offerId, {
            projectId: args.projectId,
            title: args.title,
            description: args.description,
            price: args.price,
            delivery_days: args.delivery_days,
            revisions: args.revisions,
        });
    },
});


export const getOffer = internalQuery({
    args: { projectId: v.id("projects"), tier: v.union(v.literal("Basic"), v.literal("Standard"), v.literal("Premium")) },
    handler: async (ctx, args) => {
        const offer = await ctx.db.query("offers")
            .withIndex("by_projectId_tier", (q) =>
                q
                    .eq("projectId", args.projectId)
                    .eq("tier", args.tier)
            )
            .unique();
        return offer;
    },
});