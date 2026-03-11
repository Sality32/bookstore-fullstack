import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Search, Shield, Trash2, User} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { confirmDelete, showSuccess } from '@/lib/swal';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Users', href: '/admin/users' },
];

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'author' | 'publisher' | 'user';
    email_verified_at: string | null;
    created_at: string;
};

type PaginatedUsers = {
    data: UserRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    users: PaginatedUsers;
    filters: { search?: string; role?: string };
};

function AddUserDialog() {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'user' as 'admin' | 'author' | 'publisher' | 'user',
        password: '',
        password_confirmation: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Full name"
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={data.role}
                            onValueChange={(val) => setData('role', val as 'admin' | 'author' | 'publisher' | 'user')}
                        >
                            <SelectTrigger id="role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="author">Author</SelectItem>
                                <SelectItem value="publisher">Publisher</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-xs text-destructive">{errors.role}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Min. 8 characters"
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Repeat password"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminUsers({ users, filters }: Props) {
    const { auth } = usePage().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole]     = useState(filters.role ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                '/admin/users',
                { search: search || undefined, role: role || undefined },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, role]);

    async function deleteUser(user: UserRow) {
        const result = await confirmDelete(user.name);
        if (!result.isConfirmed) return;
        router.delete(`/admin/users/${user.id}`, {
            onSuccess: () => showSuccess(`User "${user.name}" deleted.`),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-sm text-muted-foreground">
                            {users.total} total users registered in the system.
                        </p>
                    </div>
                    <AddUserDialog />
                </div>

                {/* Search + Filter */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={role || 'all'} onValueChange={(v) => setRole(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="publisher">Publisher</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">{user.id}</td>
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {user.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                    className="flex w-fit items-center gap-1 capitalize"
                                                >
                                                    {user.role === 'admin' ? (
                                                        <Shield className="size-3" />
                                                    ) : (
                                                        <User className="size-3" />
                                                    )}
                                                    {user.role}
                                                </Badge>
                                            </td>
                                          
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.id !== auth.user.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => deleteUser(user)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {users.current_page} of {users.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {users.prev_page_url && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={users.prev_page_url}>Previous</Link>
                                        </Button>
                                    )}
                                    {users.next_page_url && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={users.next_page_url}>Next</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
