import { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, FileText, CreditCard, ListChecks, FolderOpen, CircleAlert } from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export const navItems: NavItem[] = [
    { label: "الرئيسية", href: "/", icon: LayoutDashboard },
    { label: "العملاء", href: "/clients", icon: Users },
    { label: "الطلبات", href: "/requests", icon: FileText },
    { label: "المتطلبات", href: "/requirements", icon: FolderOpen },
    { label: "الاشتراكات", href: "/subscriptions", icon: CreditCard },
    { label: "مكتب الدعم", href: "/support", icon: CircleAlert },
    { label: "المهام", href: "/tasks", icon: ListChecks },
];