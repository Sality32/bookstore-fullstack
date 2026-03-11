import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Book, Edit, Plus, Search, Trash2 } from 'lucide-react';
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
    { title: 'My Books', href: '/author/books' },
];

type PublisherOption = { id: number; name: string };

type BookRow = {
    id: number;
    title: string;
    description: string | null;
    isbn: string | null;
    price: string;
    stock: number;
    published_year: number | null;
    publisher_id: number;
    publisher: PublisherOption;
};

type PaginatedBooks = {
    data: BookRow[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type AuthorInfo = { id: number; name: string; bio: string | null };

type Filters = { search?: string };

type Props = {
    author: AuthorInfo;
    books: PaginatedBooks;
    publishers: PublisherOption[];
    filters: Filters;
};

type BookFormData = {
    title: string;
    description: string;
    isbn: string;
    price: string;
    stock: string;
    cover_image: string;
    published_year: string;
    publisher_id: string;
};

const emptyForm: BookFormData = {
    title: '',
    description: '',
    isbn: '',
    price: '',
    stock: '0',
    cover_image: '',
    published_year: '',
    publisher_id: '',
};

// ─── Book Form Fields ──────────────────────────────────────────────────────────
function BookFormFields({
    data,
    setData,
    errors,
    publishers,
}: {
    data: BookFormData;
    setData: (field: keyof BookFormData, value: string) => void;
    errors: Partial<Record<keyof BookFormData, string>>;
    publishers: PublisherOption[];
}) {
    return (
        <>
            <div className="space-y-1">
                <Label>Title *</Label>
                <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Book title" />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                    value={data.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                    placeholder="Book description..."
                    rows={2}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-1">
                <Label>Publisher *</Label>
                <Select value={data.publisher_id} onValueChange={(v) => setData('publisher_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Select publisher..." /></SelectTrigger>
                    <SelectContent>
                        {publishers.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.publisher_id && <p className="text-xs text-destructive">{errors.publisher_id}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label>Price *</Label>
                    <Input value={data.price} onChange={(e) => setData('price', e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" />
                    {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Stock *</Label>
                    <Input value={data.stock} onChange={(e) => setData('stock', e.target.value)} type="number" min="0" placeholder="0" />
                    {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Year</Label>
                    <Input value={data.published_year} onChange={(e) => setData('published_year', e.target.value)} type="number" min="1000" max="2100" placeholder="2024" />
                    {errors.published_year && <p className="text-xs text-destructive">{errors.published_year}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>ISBN</Label>
                    <Input value={data.isbn} onChange={(e) => setData('isbn', e.target.value)} placeholder="978-0-00-000000-0" />
                    {errors.isbn && <p className="text-xs text-destructive">{errors.isbn}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Cover Image URL</Label>
                    <Input value={data.cover_image} onChange={(e) => setData('cover_image', e.target.value)} placeholder="https://..." type="url" />
                    {errors.cover_image && <p className="text-xs text-destructive">{errors.cover_image}</p>}
                </div>
            </div>
        </>
    );
}

// ─── Create Modal ──────────────────────────────────────────────────────────────
function CreateBookModal({
    open,
    onClose,
    publishers,
}: {
    open: boolean;
    onClose: () => void;
    publishers: PublisherOption[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm<BookFormData>(emptyForm);

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/author/books', {
            onSuccess: () => {
                showSuccess('Book created successfully.');
                reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <BookFormFields data={data} setData={setData} errors={errors} publishers={publishers} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Create Book'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditBookModal({
    book,
    onClose,
    publishers,
}: {
    book: BookRow;
    onClose: () => void;
    publishers: PublisherOption[];
}) {
    const { data, setData, put, processing, errors } = useForm<BookFormData>({
        title: book.title,
        description: book.description ?? '',
        isbn: book.isbn ?? '',
        price: book.price,
        stock: String(book.stock),
        cover_image: '',
        published_year: book.published_year ? String(book.published_year) : '',
        publisher_id: String(book.publisher_id),
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/author/books/${book.id}`, {
            onSuccess: () => {
                showSuccess('Book updated successfully.');
                onClose();
            },
        });
    }

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Book</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <BookFormFields data={data} setData={setData} errors={errors} publishers={publishers} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Update Book'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function AuthorBooks({ author, books, publishers, filters }: Props) {
    const { flash } = usePage().props;
    const [createOpen, setCreateOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<BookRow | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                '/author/books',
                { search: search || undefined },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (flash?.error) showError(flash.error);
    }, [flash?.error]);

    async function handleDelete(book: BookRow) {
        const result = await confirmDelete(book.title);
        if (!result.isConfirmed) return;

        router.delete(`/author/books/${book.id}`, {
            onSuccess: () => showSuccess('Book deleted successfully.'),
            onError: () => showError('Failed to delete book.'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Books" />

            <CreateBookModal open={createOpen} onClose={() => setCreateOpen(false)} publishers={publishers} />

            {editingBook && (
                <EditBookModal
                    key={editingBook.id}
                    book={editingBook}
                    onClose={() => setEditingBook(null)}
                    publishers={publishers}
                />
            )}

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Book className="size-5" />
                                <CardTitle>My Books</CardTitle>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">Books authored by {author.name}</p>
                        </div>
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-1 size-4" />
                            Add Book
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 relative">
                            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                className="pl-8"
                                placeholder="Search title or ISBN…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">
                            {books.total} book{books.total !== 1 ? 's' : ''} in your catalogue.
                        </p>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Publisher</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">ISBN</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {books.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No books yet. Add your first book!
                                            </td>
                                        </tr>
                                    )}
                                    {books.data.map((book) => (
                                        <tr key={book.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground">{book.id}</td>
                                            <td className="px-4 py-3 font-medium">{book.title}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{book.publisher.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{book.isbn ?? '—'}</td>
                                            <td className="px-4 py-3">${Number(book.price).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={book.stock > 0 ? 'secondary' : 'destructive'}>{book.stock}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" onClick={() => setEditingBook(book)}>
                                                        <Edit className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(book)}
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

                        {books.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Page {books.current_page} of {books.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {books.prev_page_url && (
                                        <Button variant="outline" size="sm" onClick={() => router.visit(books.prev_page_url!)}>Previous</Button>
                                    )}
                                    {books.next_page_url && (
                                        <Button variant="outline" size="sm" onClick={() => router.visit(books.next_page_url!)}>Next</Button>
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
