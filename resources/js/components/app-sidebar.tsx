import { Link, usePage } from '@inertiajs/react';
import { Book, BookOpen, Building2, LayoutGrid, PenLine, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { dashboard } from '@/routes';

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user.role;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(role === 'admin'
            ? [
                  { title: 'Users', href: '/admin/users', icon: Users },
                  { title: 'Authors', href: '/admin/authors', icon: PenLine },
                  { title: 'Publishers', href: '/admin/publishers', icon: Building2 },
                  { title: 'Books', href: '/admin/books', icon: Book },
              ]
            : []),
        ...(role === 'author' ? [{ title: 'My Books', href: '/author/books', icon: Book }] : []),
        ...(role === 'publisher' ? [{ title: 'My Catalog', href: '/publisher/books', icon: BookOpen }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

