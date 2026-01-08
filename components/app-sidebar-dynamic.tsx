"use client"

import dynamic from "next/dynamic"

export const AppSidebar = dynamic(
    () => import("@/components/app-sidebar").then((mod) => mod.AppSidebar),
    { ssr: false }
)
