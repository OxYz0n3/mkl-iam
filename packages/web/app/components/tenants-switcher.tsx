import { ChevronsUpDown, Plus, Settings, Users } from "lucide-react"
import { useNavigate } from "react-router"

import type { GetTenantsResponse, Tenant } from "@mkl-iam/back/src/tenants/model"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { Skeleton } from "~/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  activeTenant,
  setActiveTenant,
}: {
  tenants: GetTenantsResponse;
  activeTenant: Tenant | null;
  setActiveTenant: (tenant: Tenant) => void;
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                disabled={!activeTenant}
                className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            { activeTenant ?
              <Avatar className="h-8 w-8 rounded-full">
                  <AvatarFallback>{ tenants.find(t => t.tenant.id === activeTenant.id)?.tenant.name[0].toLocaleUpperCase().split(' ').map(t => t[0]).join('') }</AvatarFallback>
              </Avatar> :
              <Skeleton className="h-8 w-8 rounded-full" />
            }
            { activeTenant ?
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{ tenants.find(t => t.tenant.id === activeTenant.id)?.tenant.name }</span>
                <span className="truncate text-xs">{ tenants.find(t => t.tenant.id === activeTenant.id)?.role }</span>
              </div>
              :
              <div className="grid flex-1 text-left text-sm leading-tight gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              
            }
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
                onClick={() => setActiveTenant(tenant.tenant)}
                className="gap-2 p-2"
              >
                <Avatar className="h-6 w-6 rounded-lg">
                    <AvatarFallback>{ tenant.tenant.name[0].toLocaleUpperCase().split(' ').map(t => t[0]).join('') }</AvatarFallback>
                </Avatar>
                { tenant.tenant.name }
                <div className="p-1 ml-auto flex items-center rounded-md border bg-transparent px-1 text-md text-muted-foreground font-semibold">
                  { tenant.employeeCount }
                  <Users className="ms-1 size-4" />
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/manage-tenants') }
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Settings className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Gérer mes entreprise</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/add-tenant")}
              className="gap-2 p-2"
            >
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
