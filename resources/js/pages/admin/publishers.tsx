import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Building2, Edit, Plus, Search, Trash2 } from 'lucide-react';
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
import { confirmDelete, showError, showSuccess } from '@/lib/swal';
import type { BreadcrumbItem } from '@/types';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Publishers', href: '/admin/publishers' },
];

type AvailableUser = { id: number; name: string; email: string };

type PublisherRow = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    address: string | null;
    website: string | null;
    user_id: number | null;
    books_count: number;
    user: AvailableUser | null;
};

type PaginatedPublishers = {
    data: PublisherRow[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = { publishers: PaginatedPublishers; availableUsers: AvailableUser[]; filters: { search?: string } };

// ─── Create Modal ──────────────────────────────────────────────────────────────
function CreatePublisherModal({
    open,
    onClose,
    availableUsers,
}: {
    open: boolean;
    onClose: () => void;
    availableUsers: AvailableUser[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        address: '',
        website: '',
        user_id: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/publishers', {
            onSuccess: () => {
                showSuccess('Publisher created successfully.');
                reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Publisher</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="c-name">Name *</Label>
                        <Input
                            id="c-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Publisher name"
                            autoFocus
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="c-desc">Description</Label>
                        <Textarea
                            id="c-desc"
                            value={data.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                            placeholder="Short description..."
                            rows={2}
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="c-address">Address</Label>
                            <Input
                                id="c-address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="City, Country"
                            />
                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="c-website">Website</Label>
                            <Input
                                id="c-website"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                placeholder="https://..."
                                type="url"
                            />
                            {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="c-user">Link to User Account (optional)</Label>
                        <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                            <SelectTrigger id="c-user">
                                <SelectValue placeholder="Select a user..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">— None —</SelectItem>
                                {availableUsers.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        {u.name} ({u.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-xs text-destructive">{errors.user_id}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Publisher'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditPublisherModal({
    publisher,
    onClose,
    availableUsers,
}: {
    publisher: PublisherRow;
    onClose: () => void;
    availableUsers: AvailableUser[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: publisher.name,
        description: publisher.description ?? '',
        address: publisher.address ?? '',
        website: publisher.website ?? '',
        user_id: publisher.user_id ? String(publisher.user_id) : '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/admin/publishers/${publisher.id}`, {
            onSuccess: () => {
                showSuccess('Publisher updated successfully.');
                onClose();
            },
        });
    }

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Publisher</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="e-name">Name *</Label>
                        <Input
                            id="e-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoFocus
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="e-desc">Description</Label>
                        <Textarea
                            id="e-desc"
                            value={data.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                            rows={2}
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="e-address">Address</Label>
                            <Input id="e-address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="e-website">Website</Label>
                            <Input id="e-website" value={data.website} onChange={(e) => setData('website', e.target.value)} type="url" />
                            {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="e-user">Link to User Account (optional)</Label>
                        <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                            <SelectTrigger id="e-user">
                                <SelectValue placeholder="Select a user..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">— None —</SelectItem>
                                {availableUsers.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        {u.name} ({u.email})
                                    </SelectItem>
                                ))}
                                {publisher.user && !availableUsers.find((u) => u.id === publisher.user_id) && (
                                    <SelectItem value={String(publisher.user_id)}>
                                        {publisher.user.name} — current
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-xs text-destructive">{errors.user_id}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update Publisher'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function AdminPublishers({ publishers, availableUsers, filters }: Props) {
    const { flash } = usePage().props;
    const [createOpen, setCreateOpen] = useState(false);
    const [editingPublisher, setEditingPublisher] = useState<PublisherRow | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                '/admin/publishers',
                { search: search || undefined },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (flash?.error) showError(flash.error);
    }, [flash?.error]);

    async function handleDelete(publisher: PublisherRow) {
        const result = await confirmDelete(publisher.name);
        if (!result.isConfirmed) return;

        router.delete(`/admin/publishers/${publisher.id}`, {
            onSuccess: () => showSuccess('Publisher deleted successfully.'),
            onError: () => showError('Failed to delete publisher.'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Publishers" />

            <CreatePublisherModal open={createOpen} onClose={() => setCreateOpen(false)} availableUsers={availableUsers} />

            {editingPublisher && (
                <EditPublisherModal
                    key={editingPublisher.id}
                    publisher={editingPublisher}
                    onClose={() => setEditingPublisher(null)}
                    availableUsers={availableUsers}
                />
            )}

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="size-5" />
                            <CardTitle>Publishers</CardTitle>
                        </div>
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-1 size-4" />
                            Add Publisher
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 relative">
                            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                className="pl-8"
                                placeholder="Search by name…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">
                            {publishers.total} publisher{publishers.total !== 1 ? 's' : ''} registered.
                        </p>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Address</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Website</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">User Account</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Books</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {publishers.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No publishers found. Add one to get started.
                                            </td>
                                        </tr>
                                    )}
                                    {publishers.data.map((publisher) => (
                                        <tr key={publisher.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground">{publisher.id}</td>
                                            <td className="px-4 py-3 font-medium">{publisher.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{publisher.address ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                {publisher.website ? (
                                                    <a
                                                        href={publisher.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary underline-offset-4 hover:underline"
                                                    >
                                                        {new URL(publisher.website).hostname}
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {publisher.user ? (
                                                    <Badge variant="outline" className="text-xs">{publisher.user.name}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">{publisher.books_count}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" onClick={() => setEditingPublisher(publisher)}>
                                                        <Edit className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(publisher)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {publishers.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Page {publishers.current_page} of {publishers.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {publishers.prev_page_url && (
                                        <Button variant="outline" size="sm" onClick={() => router.visit(publishers.prev_page_url!)}>Previous</Button>
                                    )}
                                    {publishers.next_page_url && (
                                        <Button variant="outline" size="sm" onClick={() => router.visit(publishers.next_page_url!)}>Next</Button>
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
