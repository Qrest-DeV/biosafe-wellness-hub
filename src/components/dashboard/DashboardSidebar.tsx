import { NavLink } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, User, Crown, Pill, FlaskConical, Stethoscope,
  ShoppingBag, Calendar, MessageCircleHeart, Settings,
} from "lucide-react";

type Section = { id: string; label: string; icon: typeof LayoutDashboard };

const overviewItems: Section[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "subscription", label: "Subscription", icon: Crown },
];

const healthItems: Section[] = [
  { id: "prescriptions", label: "Prescriptions", icon: Pill },
  { id: "labs", label: "Lab Results", icon: FlaskConical },
  { id: "consultations", label: "Consultations", icon: Stethoscope },
];

const externalItems = [
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/services", label: "Telehealth", icon: MessageCircleHeart },
  { to: "/subscriptions", label: "Plans", icon: Calendar },
];

export const DashboardSidebar = ({
  active, onSelect,
}: { active: string; onSelect: (id: string) => void }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderGroup = (label: string, items: Section[]) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => (
            <SidebarMenuItem key={it.id}>
              <SidebarMenuButton
                isActive={active === it.id}
                onClick={() => onSelect(it.id)}
                className="cursor-pointer"
              >
                <it.icon className="h-4 w-4" />
                {!collapsed && <span>{it.label}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {renderGroup("Account", overviewItems)}
        {renderGroup("Health Records", healthItems)}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Explore</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {externalItems.map((it) => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={it.to} className="flex items-center gap-2">
                      <it.icon className="h-4 w-4" />
                      {!collapsed && <span>{it.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
