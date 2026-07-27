 import { LucideIcon } from "lucide-react";
 import { LayoutDashboard, Users , FileText , CreditCard , ListChecks } from 'lucide-react';

 export interface NavItem {
     lable : string ;
     href: string ; 
     icon : LucideIcon ;
 }

 export const navItems = [
     { label: "الرئيسية", href: "/", icon: LayoutDashboard },
     { label: "العملاء", href: "/clients", icon: Users },
     { label: "الطلبات", href: "/requests", icon: FileText },
     { label: "الاشتراكات", href: "/subscriptions", icon: CreditCard },
     { label: "المهام", href: "/tasks", icon: ListChecks },]