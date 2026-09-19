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
} from "@liorian/sdk/presentation/ui/breadcrumb"
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";

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
      
      // Essayer de trouver le module le plus spécifique correspondant au chemin
      const moduleDecl = modules
        .filter(m => m.uri && m.uri !== "/" && currentPath.startsWith(m.uri))
        .sort((a, b) => b.uri.length - a.uri.length)[0]

      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

      if (moduleDecl) {
        label = moduleDecl.name
      }

      items.push({
        label,
        href: currentPath,
        isLast
      })
    })

    return items
  }, [pathSegments, modules])

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
