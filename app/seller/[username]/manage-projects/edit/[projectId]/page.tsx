"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Description } from "@/components/description";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Images } from "@/components/images";
import { TitleEditor } from "@/components/title-editor";

import { Label } from "@/components/ui/label";
import { OffersEditor } from "./_components/offers-editor";



interface EditdPageProps {
    params: {
        projectId: string;
    };
};

const Edit = ({ params }: EditdPageProps) => {
    const project = useQuery(api.project.get, { id: params.projectId as Id<"projects"> })
    const published = useQuery(api.project.isPublished, { id: params.projectId as Id<"projects"> });
    const {
        mutate: remove,
        pending: removePending,
    } = useApiMutation(api.project.remove);
    const {
        mutate: publish,
        pending: publishPending,
    } = useApiMutation(api.project.publish);
    const {
        mutate: unpublish,
        pending: unpublishPending,
    } = useApiMutation(api.project.unpublish);
    const router = useRouter();

    const identity = useAuth();

    const generateUploadUrl = useMutation(api.projectMedia.generateUploadUrl);

    const imageInput = useRef<HTMLInputElement>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const sendImage = useMutation(api.projectMedia.sendImage);


    if (!identity) {
        throw new Error("Unauthorized");
    }

    // Undefined means it's still retrieving
    if (project === undefined || published === undefined) {
        return null;
    }

    if (project === null) {
        return <div>Tidak ditemukan</div>;
    }

    async function handleSendImage(event: FormEvent) {
        event.preventDefault();
        if (project === undefined) return;

        const nonNullableproject = project as Doc<"projects">;

        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

        await Promise.all(selectedImages.map(async (image) => {
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": image.type },
                body: image,
            });

            const json = await result.json();

            if (!result.ok) {
                throw new Error(`Upload gagal: ${JSON.stringify(json)}`);
            }
            const { storageId } = json;
            // Step 3: Save the newly allocated storage id to the database
            await sendImage({ storageId, format: "image", projectId: nonNullableproject._id })
                .catch((error) => {
                    console.log(error);
                    toast.error("Maksimum 5 gambar tercapai.");
                });
        }));

        setSelectedImages([]);
        imageInput.current!.value = "";
    }

    const onPublish = async () => {
        console.log(published)
        if (!published) {
            publish({ id: params.projectId as Id<"projects"> })
                .catch((error) => {
                    console.log(error);
                    toast.error("Gagal dipublikasikan. Pastikan setidaknya ada 1 gambar, 3 penawaran, dan deskripsi.");
                });
        }
        else {
            unpublish({ id: params.projectId as Id<"projects"> })
        }
    }

    const onDelete = async () => {
        remove({ id: params.projectId as Id<"projects"> });
        router.back();
    };


    return (
        <>
            <div className="space-y-12 2xl:px-64 xl:px-36 md:px-12 px-12">
                <div className="flex justify-end pr-2 space-x-2">
                    <Button disabled={publishPending || unpublishPending} variant={"default"} onClick={onPublish}>
                        {published ? "Unpublish" : "Publish"}
                    </Button>
                    <Link href={`/${project.seller.username}/${project._id}`}>
                        <Button disabled={removePending} variant={"secondary"}>
                            Preview
                        </Button>
                    </Link>
                    <Button disabled={removePending} variant={"secondary"} onClick={onDelete}>
                        Hapus
                    </Button>
                </div>

                <TitleEditor
                    id={project._id}
                    title={project.title}
                />
                <div className="w-[800px]">
                    <Images
                        images={project.images}
                        title={project.title}
                        allowDelete={true}

                    />
                </div>
                <form onSubmit={handleSendImage} className="space-y-2">
                    <Label className="font-normal">Upload hingga 5 gambar:</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            ref={imageInput}
                            onChange={(event) => setSelectedImages(Array.from(event.target.files || []))}
                            multiple
                            className="cursor-pointer w-fit bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:border-zinc-400 focus:border-zinc-400 focus:bg-zinc-200"
                            disabled={selectedImages.length !== 0}
                        />
                        <Button
                            type="submit"
                            disabled={selectedImages.length === 0}
                            className="w-fit"
                        >Upload Gambar</Button>
                    </div>
                </form>

                <OffersEditor
                    projectId={project._id}
                />

                <h2 className="font-semibold">Tentang project ini</h2>
            </div>


            <Description
                initialContent={project.description}
                editable={true}
                className="pb-40 mt-12 2xl:px-[200px] xl:px-[90px] xs:px-[17px]"
                projectId={project._id}
            />

        </>
    )
}

export default Edit;