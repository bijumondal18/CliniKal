"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";

const overviewIcon = "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z";

const group1 = [
  { href: "/dashboard", label: "Overview", icon: overviewIcon },
  { href: "/dashboard/patients", label: "Patients", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/doctors", label: "Doctors", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  { href: "/dashboard/prescriptions", label: "Prescriptions", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
];

const group2 = [
  { href: "/dashboard/appointments", label: "Appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/dashboard/reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/messages", label: "Messages", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/dashboard/staff", label: "Staff", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
];

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
    </svg>
  );
}

function NavLink({
  href,
  label,
  icon,
  isActive,
  collapsed,
}: {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center transition-colors ${
        collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
      } ${
        isActive
          ? "bg-blue-400/25 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      } rounded-lg`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center">
        <NavIcon icon={icon} className="h-5 w-5" />
      </span>
      {!collapsed && <span className="truncate text-sm font-medium">{label}</span>}
    </Link>
  );
}

function IconGroup({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  return (
    <div
      className={`rounded-xl bg-white/10 p-2 ${
        collapsed ? "space-y-1" : "space-y-0.5"
      }`}
    >
      {children}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const { logout } = useAuth();
  const isOverviewActive = pathname === "/dashboard";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col rounded-r-2xl transition-[width] duration-200 ${
        collapsed ? "w-20" : "w-56"
      }`}
      style={{ background: "var(--sidebar-dark)" }}
    >
      <div className="flex flex-1 flex-col overflow-hidden py-4">
        {/* Top: Overview (prominent circular icon) */}
        <div className={`px-3 ${collapsed ? "flex justify-center" : "px-3"}`}>
          <Link
            href="/dashboard"
            className={`flex items-center transition-colors ${
              collapsed ? "justify-center py-2" : "gap-3 px-3 py-2"
            } ${
              isOverviewActive
                ? "text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            } rounded-xl`}
            title="Overview"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                isOverviewActive ? "bg-emerald-500 dark:bg-emerald-600" : "bg-white/10"
              }`}
            >
              <NavIcon icon={overviewIcon} className="h-6 w-6" />
            </span>
            {!collapsed && <span className="text-sm font-semibold">Overview</span>}
          </Link>
        </div>

        {/* Group 1: Patients, Doctors, Prescriptions, Appointments */}
        <div className="mt-4 px-3">
          <IconGroup collapsed={collapsed}>
            {group1.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(item.href + "/")
                }
                collapsed={collapsed}
              />
            ))}
          </IconGroup>
        </div>

        {/* Group 2: Reports, Messages, Staff */}
        <div className="mt-3 px-3">
          <IconGroup collapsed={collapsed}>
            {group2.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href || pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}
          </IconGroup>
        </div>

        {/* Spacer to push bottom group down */}
        <div className="flex-1" />

        {/* Bottom group: Settings + Logout */}
        <div className="px-3 pb-3">
          <IconGroup collapsed={collapsed}>
            <NavLink
              href="/dashboard/settings"
              label="Settings"
              icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              isActive={pathname === "/dashboard/settings"}
              collapsed={collapsed}
            />
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center transition-colors rounded-lg text-white/80 hover:bg-white/10 hover:text-white ${
                collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
              }`}
              title="Logout"
              aria-label="Logout"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              {!collapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </IconGroup>
        </div>

        {/* Collapse / Expand - only when expanded */}
        {!collapsed && (
          <div className="border-t border-white/10 px-3 pt-2">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </span>
              <span>Collapse</span>
            </button>
          </div>
        )}
        {collapsed && (
          <div className="mt-2 px-3">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex w-full justify-center rounded-xl py-2.5 text-white/70 hover:bg-white/10 hover:text-white"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
