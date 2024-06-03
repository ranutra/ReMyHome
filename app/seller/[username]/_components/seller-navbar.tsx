"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Loading } from "@/components/auth/loading"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Orders",
        href: "/docs/primitives/alert-dialog",
        description:
            "Dialog modal yang menginterupsi pengguna dengan konten penting dan mengharapkan respons.",
    },
    {
        title: "Projects",
        href: "/docs/primitives/hover-card",
        description:
            "Agar pengguna yang dapat melihat preview dari konten yang tersedia di balik tautan.",
    },
    {
        title: "Profile",
        href: "/profile",
        description:
            "Menampilkan indikator yang menunjukkan kemajuan penyelesaian tugas, biasanya ditampilkan sebagai progress bar.",
    }
]

export const SellerNavbar = () => {
    const currentUser = useQuery(api.users.getCurrentUser);

    const router = useRouter();

    const onClickInbox = () => {
        router.push("/inbox");
    }

    return (
        <div className="relative">
            <div className="flex justify-center lg:absolute top-0 right-0">
                <div className="w-fit flex gap-x-1 items-center p-3">
                    <Button className="p-0 text-muted-foreground" onClick={onClickInbox} variant={"ghost"}>
                        <MessageCircle className="p-0" />
                    </Button>
                    {currentUser && (
                        <Button variant={"ghost"} className="text-muted-foreground" onClick={() => router.push(`/`)}>
                            Beralih ke Pembelian
                        </Button>
                    )}
                    <UserButton />
                </div>
            </div>
            <div className="flex w-full justify-center p-3">
                <NavigationMenu>
                    <NavigationMenuList className="flex flex-col md:flex-row">
                        <NavigationMenuItem>
                            <Link href="/docs" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Dashboard
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Bisnis Saya</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                    <li className="row-span-3">
                                        <NavigationMenuLink asChild>
                                            <a
                                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                                href="/"
                                            >
                                                {/* <Image className="h-6 w-6" /> */}
                                                <div className="mb-2 mt-4 text-lg font-medium">
                                                    Orders
                                                </div>
                                                <p className="text-sm leading-tight text-muted-foreground">
                                                    Pantau pesanan dan pengiriman Anda. Kelola semuanya di satu tempat.
                                                </p>
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                    <ListItem href={`/seller/${currentUser?.username}/manage-projects`} title="Projects">
                                        Kelola, buat, dan edit project Anda di sini.
                                    </ListItem>
                                    <ListItem href={`/seller/${currentUser}/profile`} title="Profile">
                                        Kelola dan edit profil Anda di sini.
                                    </ListItem>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Periklanan & Perkembangan</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                    {components.map((component) => (
                                        <ListItem
                                            key={component.title}
                                            title={component.title}
                                            href={component.href}
                                        >
                                            {component.description}
                                        </ListItem>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/docs" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Analisis
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"