import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type BookDetail = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    isbn: string | null;
    price: string;
    stock: number;
    cover_image: string | null;
    published_year: number | null;
    publisher: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Books', href: '/author/books' },
    { title: 'Detail', href: '#' },
];

export default function AuthorBookShow({ book }: { book: BookDetail }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={book.title} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/author/books">
                            <ArrowLeft className="mr-1 size-4" />
                            Back to My Books
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 pb-4">
                        <BookOpen className="size-5" />
                        <CardTitle>{book.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Stock: {book.stock}</Badge>
                            {book.stock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Publisher</p>
                                <p className="text-sm">{book.publisher?.name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Price</p>
                                <p className="text-sm">${Number(book.price).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">ISBN</p>
                                <p className="text-sm">{book.isbn ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Published Year</p>
                                <p className="text-sm">{book.published_year ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                                <p className="text-sm text-muted-foreground">{book.slug}</p>
                            </div>
                        </div>

                        {book.description && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="mt-1 whitespace-pre-line text-sm">{book.description}</p>
                            </div>
                        )}

                        {book.cover_image && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cover Image</p>
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className="mt-1 h-40 w-auto rounded-md object-cover"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
