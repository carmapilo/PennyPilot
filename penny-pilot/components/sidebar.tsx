"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock, FileText, Map, Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Purchase History",
    href: "/purchase-history",
    icon: Clock,
  },
  {
    title: "Receipt Scanner",
    href: "/receipt-scanner",
    icon: FileText,
  },
  {
    title: "Trip Planner",
    href: "/trip-planner",
    icon: Map,
  },
  {
    title: "Recipe Search",
    href: "/recipe-search",
    icon: Search,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed left-4 top-3 z-50 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-[60px] bottom-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-green-50 text-green-700"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">© 2023 Penny Pilot</p>
        </div>
      </div>
    </>
  );
}
