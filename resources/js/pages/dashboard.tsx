import { Head, usePage } from '@inertiajs/react';
import { BarChart3, CheckCircle, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

type AdminStats = {
    total_users: number;
    admin_users: number;
    regular_users: number;
    verified_users: number;
};

type Props = {
    stats: AdminStats | Record<string, never>;
};

export default function Dashboard({ stats }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Banner */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <ShieldCheck className="size-8 text-primary" />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Welcome back, {auth.user.name}!
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                You are logged in as{' '}
                                <span className="font-medium capitalize text-primary">
                                    {auth.user.role}
                                </span>
                                . Here's what's happening today.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admin Stats */}
                {isAdmin && 'total_users' in stats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.total_users}</div>
                                <p className="text-xs text-muted-foreground">All registered accounts</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                                <ShieldCheck className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.admin_users}</div>
                                <p className="text-xs text-muted-foreground">Administrator accounts</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                                <BarChart3 className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.regular_users}</div>
                                <p className="text-xs text-muted-foreground">Standard user accounts</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                                <CheckCircle className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.verified_users}</div>
                                <p className="text-xs text-muted-foreground">Email-verified accounts</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Role permission info */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold">
                        {isAdmin ? 'Admin Access' : 'Your Access'}
                    </h2>
                    
                </div>
            </div>
        </AppLayout>
    );
}

