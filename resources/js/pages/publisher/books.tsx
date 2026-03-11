import { Head, router } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Catalog', href: '/publisher/books' },
];

type AuthorOption = { id: number; name: string };

type BookRow = {
    id: number;
    title: string;
    isbn: string | null;
    price: string;
    stock: number;
    published_year: number | null;
    author: AuthorOption;
};

type PaginatedBooks = {
    data: BookRow[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type PublisherInfo = { id: number; name: string; description: string | null };

type Props = {
    publisher: PublisherInfo;
    books: PaginatedBooks;
};

export default function PublisherBooks({ publisher, books }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Catalog" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-5" />
                            <CardTitle>My Catalog</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Books published by <strong>{publisher.name}</strong>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                            {books.total} book{books.total !== 1 ? 's' : ''} in your catalog.
                        </p>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Author</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">ISBN</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {books.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No books in your catalog yet.
                                            </td>
                                        </tr>
                                    )}
                                    {books.data.map((book) => (
                                        <tr key={book.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground">{book.id}</td>
                                            <td className="px-4 py-3 font-medium">{book.title}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{book.author.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{book.isbn ?? '—'}</td>
                                            <td className="px-4 py-3">${Number(book.price).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={book.stock > 0 ? 'secondary' : 'destructive'}>{book.stock}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{book.published_year ?? '—'}</td>
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
