"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import { useMutation } from "convex/react";
import { AlertOctagon } from "lucide-react";
import { toast } from "sonner";

interface DescriptionProps {
    projectId: Id<"projects">;
    initialContent?: string;
    editable: boolean;
    className?: string;
}

export const Description = ({
    projectId,
    initialContent,
    editable,
    className
}: DescriptionProps) => {
    const update = useMutation(api.project.updateDescription);

    const editor = useCreateBlockNote({
        initialContent:
            initialContent
                ? JSON.parse(initialContent)
                : undefined,
    });

    const handleChange = () => {
        if (editor.document) {
            const contentLength = JSON.stringify(editor.document).length;
            if (contentLength < 20000) {
                update({
                    id: projectId,
                    description: JSON.stringify(editor.document, null, 2)
                });
            } else {
                toast.error('Konten terlalu panjang. Tidak disimpan.', {
                    duration: 2000,
                    icon: <AlertOctagon />,
                });
            }
        }
    };

    return (
        <BlockNoteView
            editor={editor}
            editable={editable}
            theme="light"
            onChange={handleChange}
            className={className}
        />
    );
}