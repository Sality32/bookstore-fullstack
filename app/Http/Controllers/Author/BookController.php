<?php

namespace App\Http\Controllers\Author;

use App\Concerns\GeneratesSlug;
use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Publisher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class BookController extends Controller
{
    use GeneratesSlug;

    private function getAuthor(): Author
    {
        $author = Author::where('user_id', Auth::id())->first();

        if (! $author) {
            abort(403, 'Your account is not linked to an author profile. Please contact the administrator.');
        }

        return $author;
    }

    public function index(Request $request): Response
    {
        $author = $this->getAuthor();

        $query = $author->books()->with('publisher:id,name')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        return inertia('author/books', [
            'author'     => $author->only('id', 'name', 'bio'),
            'books'      => $query->paginate(15)->withQueryString(),
            'publishers' => Publisher::select('id', 'name')->orderBy('name')->get(),
            'filters'    => $request->only('search'),
        ]);
    }

    public function show(Book $book): Response
    {
        $author = $this->getAuthor();

        abort_if($book->author_id !== $author->id, 403);

        return inertia('author/books/show', [
            'book' => $book->load('publisher'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $author = $this->getAuthor();

        $data = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:10000'],
            'isbn'           => ['nullable', 'string', 'max:20', 'unique:books,isbn'],
            'price'          => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'stock'          => ['required', 'integer', 'min:0', 'max:999999'],
            'cover_image'    => ['nullable', 'string', 'max:500'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'publisher_id'   => ['required', 'exists:publishers,id'],
        ]);

        $author->books()->create([...$data, 'slug' => $this->uniqueSlug($data['title'], Book::class)]);

        return back()->with('success', 'Book created successfully.');
    }

    public function update(Request $request, Book $book): RedirectResponse
    {
        $author = $this->getAuthor();

        abort_if($book->author_id !== $author->id, 403);

        $data = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:10000'],
            'isbn'           => ['nullable', 'string', 'max:20', 'unique:books,isbn,' . $book->id],
            'price'          => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'stock'          => ['required', 'integer', 'min:0', 'max:999999'],
            'cover_image'    => ['nullable', 'string', 'max:500'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'publisher_id'   => ['required', 'exists:publishers,id'],
        ]);

        $book->update([...$data, 'slug' => $this->uniqueSlug($data['title'], Book::class, $book->id)]);

        return back()->with('success', 'Book updated successfully.');
    }

    public function destroy(Book $book): RedirectResponse
    {
        $author = $this->getAuthor();

        abort_if($book->author_id !== $author->id, 403);

        $book->delete();

        return back()->with('success', 'Book deleted successfully.');
    }
}
