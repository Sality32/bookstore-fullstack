import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit, PenLine, Plus, Search, Trash2 } from 'lucide-react';
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
    { title: 'Authors', href: '/admin/authors' },
];

type AvailableUser = { id: number; name: string; email: string };

type AuthorRow = {
    id: number;
    name: string;
    slug: string;
    bio: string | null;
    user_id: number | null;
    books_count: number;
    user: AvailableUser | null;
};

type PaginatedAuthors = {
    data: AuthorRow[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = { authors: PaginatedAuthors; availableUsers: AvailableUser[]; filters: { search?: string } };

// ─── Create Modal ──────────────────────────────────────────────────────────────
function CreateAuthorModal({
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
        bio: '',
        user_id: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/authors', {
            onSuccess: () => {
                showSuccess('Author created successfully.');
                reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Author</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="create-name">Name *</Label>
                        <Input
                            id="create-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Author's full name"
                            autoFocus
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="create-bio">Bio</Label>
                        <Textarea
                            id="create-bio"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            placeholder="Short biography..."
                            rows={3}
                        />
                        {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="create-user">Link to User Account (optional)</Label>
                        <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                            <SelectTrigger id="create-user">
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
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Author'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditAuthorModal({
    author,
    onClose,
    availableUsers,
}: {
    author: AuthorRow;
    onClose: () => void;
    availableUsers: AvailableUser[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: author.name,
        bio: author.bio ?? '',
        user_id: author.user_id ? String(author.user_id) : '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/admin/authors/${author.id}`, {
            onSuccess: () => {
                showSuccess('Author updated successfully.');
                onClose();
            },
        });
    }

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Author</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="edit-name">Name *</Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoFocus
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="edit-bio">Bio</Label>
                        <Textarea
                            id="edit-bio"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            rows={3}
                        />
                        {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="edit-user">Link to User Account (optional)</Label>
                        <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                            <SelectTrigger id="edit-user">
                                <SelectValue placeholder="Select a user..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">— None —</SelectItem>
                                {/* Show all author-role users; backend validates uniqueness */}
                                {availableUsers.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        {u.name} ({u.email})
                                    </SelectItem>
                                ))}
                                {/* If current linked user isn't in list, show them */}
                                {author.user && !availableUsers.find((u) => u.id === author.user_id) && (
                                    <SelectItem value={String(author.user_id)}>
                                        {author.user.name} ({author.user.email}) — current
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-xs text-destructive">{errors.user_id}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update Author'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function AdminAuthors({ authors, availableUsers, filters }: Props) {
    const { flash } = usePage().props;
    const [createOpen, setCreateOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<AuthorRow | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                '/admin/authors',
                { search: search || undefined },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    // Show server-side flash on redirect (e.g. after delete with error)
    useEffect(() => {
        if (flash?.error) showError(flash.error);
    }, [flash?.error]);

    async function handleDelete(author: AuthorRow) {
        const result = await confirmDelete(author.name);
        if (!result.isConfirmed) return;

        router.delete(`/admin/authors/${author.id}`, {
            onSuccess: () => showSuccess('Author deleted successfully.'),
            onError: () => showError('Failed to delete author.'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Authors" />

            <CreateAuthorModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                availableUsers={availableUsers}
            />

            {editingAuthor && (
                <EditAuthorModal
                    key={editingAuthor.id}
                    author={editingAuthor}
                    onClose={() => setEditingAuthor(null)}
                    availableUsers={availableUsers}
                />
            )}

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <PenLine className="size-5" />
                            <CardTitle>Authors</CardTitle>
                        </div>
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-1 size-4" />
                            Add Author
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
                            {authors.total} author{authors.total !== 1 ? 's' : ''} registered.
                        </p>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bio</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">User Account</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Books</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {authors.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                No authors found. Add one to get started.
                                            </td>
                                        </tr>
                                    )}
                                    {authors.data.map((author) => (
                                        <tr key={author.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground">{author.id}</td>
                                            <td className="px-4 py-3 font-medium">{author.name}</td>
                                            <td className="max-w-xs px-4 py-3 text-muted-foreground">
                                                {author.bio
                                                    ? author.bio.length > 60
                                                        ? author.bio.slice(0, 60) + '…'
                                                        : author.bio
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {author.user ? (
                                                    <Badge variant="outline" className="text-xs">
                                                        {author.user.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">{author.books_count}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setEditingAuthor(author)}
                                                    >
                                                        <Edit className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(author)}
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

                        {/* Pagination */}
                        {authors.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Page {authors.current_page} of {authors.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {authors.prev_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.visit(authors.prev_page_url!)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {authors.next_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.visit(authors.next_page_url!)}
                                        >
                                            Next
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
