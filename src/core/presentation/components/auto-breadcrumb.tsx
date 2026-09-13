"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@sentients/sdk/presentation/ui/breadcrumb"
import { defaultModulesNavConfig } from "@/modules.config"
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store";

export function AutoBreadcrumb() {
  const pathname = usePathname()
  const {modules} = useModuleStore()
  const pathSegments = React.useMemo(() => {
    if (!pathname || pathname === "/") return []
    return pathname.split("/").filter(Boolean)
  }, [pathname])

  const breadcrumbs = React.useMemo(() => {
    const items = []
    let currentPath = ""

    // On ajoute toujours le dashboard ou l'accueil si ce n'est pas déjà le premier segment
    const hasDashboardAsFirst = pathSegments[0] === "dashboard"
    
    if (!hasDashboardAsFirst) {
        items.push({
            label: "Accueil",
            href: "/",
            isLast: pathSegments.length === 0
        })
    }

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Essayer de trouver un label dans la config des modules
      const navConfig = defaultModulesNavConfig.find(m => m.url === currentPath)
      const moduleDecl = modules.find(m => m.uri === currentPath)
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
      
      if (navConfig) {
        label = navConfig.label
      } else if (moduleDecl) {
        label = moduleDecl.name
      }

      items.push({
        label,
        href: currentPath,
        isLast
      })
    })

    return items
  }, [pathSegments])

  if (breadcrumbs.length === 0) {
      return (
          <Breadcrumb>
              <BreadcrumbList>
                  <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs">Accueil</BreadcrumbPage>
                  </BreadcrumbItem>
              </BreadcrumbList>
          </Breadcrumb>
      )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="text-xs">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href} className="text-xs">{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
