"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { useState } from "react"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { useApiMutation } from "@/hooks/use-api-mutation"
import { useRouter } from "next/navigation"

interface CreateFormProps {
  username: string;
}

const CreateFormSchema = z.object({
  title: z
    .string()
    .min(20, {
      message: "Nama project harus terdiri dari minimal 20 karakter.",
    })
    .max(70, {
      message: "Nama project tidak boleh lebih dari 70 karakter."
    }),
  category: z
    .string({
      required_error: "Silakan pilih kategori."
    }),
  subcategoryId: z
  .string({
      required_error: "Silahkan pilih sub-kategori.",
  })
})

type CreateFormValues = z.infer<typeof CreateFormSchema>

const defaultValues: Partial<CreateFormValues> = {
  title: "",
}

export const CreateForm = ({
  username
}: CreateFormProps) => {
  const categories = useQuery(api.categories.get);
  const [subcategories, setSubcategories] = useState<Doc<"subcategories">[]>([]);
  const {
    mutate,
    pending
  } = useApiMutation(api.project.create);
  const router = useRouter();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function handleCategoryChange(categoryName: string){
    if (categories === undefined ) return;
    const selectedCategory = categories.find(category => category.name === categoryName);
    if (selectedCategory) {
      setSubcategories(selectedCategory.subcategories);
    }
  }
  
  function onSubmit(data: CreateFormValues) {
    mutate({
      title: data.title,
      description: "",
      subcategoryId: data.subcategoryId,
    })
      .then((projectId: Id<"projects">) => {
        toast.info("Project berhasil dibuat.");
        router.push(`/seller/$[username]/manage-projects/edit/${projectId}`)
      })
      .catch(() => {
        toast.error("Gagal membuat project.")
      })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="A huevo nice~" {...field} />
              </FormControl>
              <FormDescription>
                Cantumkan min. 20 max. 70 karakter agar semakin menarik dan mudah ditemukan oleh pembeli.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(categoryName: string) => {
                field.onChange(categoryName);
                handleCategoryChange(categoryName);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                </FormControl>
                {categories && (
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id}
                      value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                )}
              </Select>
              <FormDescription>
                Pilih kategori yang sesuai dengan project anda.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subcategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                      <SelectValue placeholder="Pilih sub-kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subcategories.map((subcategory, index) => (
                    <SelectItem key={index} value={subcategory._id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Sub-kategori akan membantu pembeli menentukan project Anda.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>Save</Button>
      </form>
    </Form>
  )
}