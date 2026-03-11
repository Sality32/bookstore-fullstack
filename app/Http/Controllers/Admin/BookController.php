<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\GeneratesSlug;
use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Publisher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class BookController extends Controller
{
    use GeneratesSlug;

    public function index(Request $request): Response
    {
        $query = Book::with('author:id,name', 'publisher:id,name')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        if ($authorId = $request->input('author_id')) {
            $query->where('author_id', $authorId);
        }

        if ($publisherId = $request->input('publisher_id')) {
            $query->where('publisher_id', $publisherId);
        }

        return inertia('admin/books', [
            'books'      => $query->paginate(15)->withQueryString(),
            'authors'    => Author::select('id', 'name')->orderBy('name')->get(),
            'publishers' => Publisher::select('id', 'name')->orderBy('name')->get(),
            'filters'    => $request->only('search', 'author_id', 'publisher_id'),
        ]);
    }

    public function show(Book $book): Response
    {
        return inertia('admin/books/show', [
            'book' => $book->load('author', 'publisher'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:10000'],
            'isbn'           => ['nullable', 'string', 'max:20', 'unique:books,isbn'],
            'price'          => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'stock'          => ['required', 'integer', 'min:0', 'max:999999'],
            'cover_image'    => ['nullable', 'string', 'max:500'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'author_id'      => ['required', 'exists:authors,id'],
            'publisher_id'   => ['required', 'exists:publishers,id'],
        ]);

        Book::create([...$data, 'slug' => $this->uniqueSlug($data['title'], Book::class)]);

        return back()->with('success', 'Book created successfully.');
    }

    public function update(Request $request, Book $book): RedirectResponse
    {
        $data = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:10000'],
            'isbn'           => ['nullable', 'string', 'max:20', 'unique:books,isbn,' . $book->id],
            'price'          => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'stock'          => ['required', 'integer', 'min:0', 'max:999999'],
            'cover_image'    => ['nullable', 'string', 'max:500'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'author_id'      => ['required', 'exists:authors,id'],
            'publisher_id'   => ['required', 'exists:publishers,id'],
        ]);

        $book->update([...$data, 'slug' => $this->uniqueSlug($data['title'], Book::class, $book->id)]);

        return back()->with('success', 'Book updated successfully.');
    }

    public function destroy(Book $book): RedirectResponse
    {
        $book->delete();

        return back()->with('success', 'Book deleted successfully.');
    }
}
