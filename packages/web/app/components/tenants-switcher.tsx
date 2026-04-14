import { ChevronsUpDown, Plus } from "lucide-react"
import { useEffect, useState } from "react"

import type { GetTenantsResponse } from "@mkl-iam/back/src/tenants/model"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"


export function TenantsSwitcher({
  tenants,
}: {
  tenants: GetTenantsResponse
}) {
  const { isMobile } = useSidebar()
  const [activeTenant, setActiveTenant] = useState(tenants[0])

  useEffect(() => setActiveTenant(tenants[0]), [ tenants ]);

  if (!activeTenant)
    return (null)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback>{ activeTenant.tenant.name[0].toLocaleUpperCase().split(' ').map(t => t[0]).join('') }</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTenant.tenant.name}</span>
            <span className="truncate text-xs">{activeTenant.role}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                Entreprises
                </DropdownMenuLabel>
            </DropdownMenuGroup>
            {tenants.map((tenant, index) => (
              <DropdownMenuItem
                key={tenant.tenant.name}
                onClick={() => setActiveTenant(tenant)}
                className="gap-2 p-2"
              >
                <Avatar className="h-6 w-6 rounded-lg">
                    <AvatarFallback>{ tenant.tenant.name[0].toLocaleUpperCase().split(' ').map(t => t[0]).join('') }</AvatarFallback>
                </Avatar>
                {tenant.tenant.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Créer une entreprise</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
