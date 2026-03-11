<?php

use App\Models\Author;
use App\Models\Book;
use App\Models\Publisher;
use App\Models\User;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAdmin(): User
{
    return User::factory()->admin()->create();
}

function makeAuthorUser(): array
{
    $user   = User::factory()->state(['role' => 'author'])->create();
    $author = Author::factory()->create(['user_id' => $user->id]);

    return [$user, $author];
}

function bookPayload(Publisher $publisher): array
{
    return [
        'title'          => 'Test Book Title',
        'description'    => 'A test description.',
        'isbn'           => '978-0-000-00000-1',
        'price'          => '19.99',
        'stock'          => 10,
        'published_year' => 2024,
        'publisher_id'   => $publisher->id,
    ];
}

// ─── Unauthenticated ──────────────────────────────────────────────────────────

test('unauthenticated user is redirected from admin books', function () {
    $this->get('/admin/books')->assertRedirect('/login');
});

test('unauthenticated user is redirected from author books', function () {
    $this->get('/author/books')->assertRedirect('/login');
});

// ─── Admin: Book List ─────────────────────────────────────────────────────────

test('admin can list books', function () {
    $admin = makeAdmin();
    Book::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get('/admin/books')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/books'));
});

test('admin can search books by title', function () {
    $admin = makeAdmin();
    Book::factory()->create(['title' => 'Unique Laravel Book']);
    Book::factory()->create(['title' => 'Another Book']);

    $this->actingAs($admin)
        ->get('/admin/books?search=Laravel')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/books')
            ->where('books.total', 1)
        );
});

test('admin can filter books by author', function () {
    $admin    = makeAdmin();
    $author1  = Author::factory()->create();
    $author2  = Author::factory()->create();
    Book::factory()->create(['author_id' => $author1->id]);
    Book::factory()->create(['author_id' => $author2->id]);

    $this->actingAs($admin)
        ->get("/admin/books?author_id={$author1->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('books.total', 1));
});

// ─── Admin: Create Book ───────────────────────────────────────────────────────

test('admin can create a book', function () {
    $admin     = makeAdmin();
    $author    = Author::factory()->create();
    $publisher = Publisher::factory()->create();

    $payload = array_merge(bookPayload($publisher), ['author_id' => $author->id]);

    $this->actingAs($admin)
        ->post('/admin/books', $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('books', ['title' => 'Test Book Title', 'description' => 'A test description.']);
});

test('admin create book requires title', function () {
    $admin     = makeAdmin();
    $author    = Author::factory()->create();
    $publisher = Publisher::factory()->create();

    $payload = array_merge(bookPayload($publisher), ['author_id' => $author->id, 'title' => '']);

    $this->actingAs($admin)
        ->post('/admin/books', $payload)
        ->assertSessionHasErrors('title');
});

// ─── Admin: Update Book ───────────────────────────────────────────────────────

test('admin can update a book', function () {
    $admin  = makeAdmin();
    $book   = Book::factory()->create();

    $this->actingAs($admin)
        ->put("/admin/books/{$book->id}", [
            'title'        => 'Updated Title',
            'description'  => 'Updated description.',
            'price'        => '29.99',
            'stock'        => 5,
            'author_id'    => $book->author_id,
            'publisher_id' => $book->publisher_id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('books', ['id' => $book->id, 'title' => 'Updated Title', 'description' => 'Updated description.']);
});

// ─── Admin: Book Detail ───────────────────────────────────────────────────────

test('admin can view book detail', function () {
    $admin = makeAdmin();
    $book  = Book::factory()->create();

    $this->actingAs($admin)
        ->get("/admin/books/{$book->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/books/show')
            ->where('book.id', $book->id)
        );
});

// ─── Admin: Delete Book ───────────────────────────────────────────────────────

test('admin can delete a book', function () {
    $admin = makeAdmin();
    $book  = Book::factory()->create();

    $this->actingAs($admin)
        ->delete("/admin/books/{$book->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('books', ['id' => $book->id]);
});

// ─── Author: Book List ────────────────────────────────────────────────────────

test('author can list their own books', function () {
    [$user, $author] = makeAuthorUser();
    Book::factory()->count(2)->create(['author_id' => $author->id]);
    Book::factory()->create(); // another author's book

    $this->actingAs($user)
        ->get('/author/books')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('author/books')
            ->where('books.total', 2)
        );
});

test('author can search their own books', function () {
    [$user, $author] = makeAuthorUser();
    Book::factory()->create(['author_id' => $author->id, 'title' => 'React Deep Dive']);
    Book::factory()->create(['author_id' => $author->id, 'title' => 'Laravel Tips']);

    $this->actingAs($user)
        ->get('/author/books?search=React')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('books.total', 1));
});

// ─── Author: Create Book ──────────────────────────────────────────────────────

test('author can create a book linked to their author profile', function () {
    [$user, $author] = makeAuthorUser();
    $publisher = Publisher::factory()->create();

    $this->actingAs($user)
        ->post('/author/books', bookPayload($publisher))
        ->assertRedirect();

    $this->assertDatabaseHas('books', [
        'title'     => 'Test Book Title',
        'author_id' => $author->id,
    ]);
});

// ─── Author: Update Book ──────────────────────────────────────────────────────

test('author can update their own book', function () {
    [$user, $author] = makeAuthorUser();
    $book = Book::factory()->create(['author_id' => $author->id]);

    $this->actingAs($user)
        ->put("/author/books/{$book->id}", [
            'title'        => 'My Updated Title',
            'description'  => 'New description.',
            'price'        => '15.00',
            'stock'        => 20,
            'publisher_id' => $book->publisher_id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('books', ['id' => $book->id, 'title' => 'My Updated Title', 'description' => 'New description.']);
});

test('author cannot update another authors book', function () {
    [$user] = makeAuthorUser();
    $otherBook = Book::factory()->create(); // belongs to a different author

    $this->actingAs($user)
        ->put("/author/books/{$otherBook->id}", [
            'title'        => 'Hacked',
            'price'        => '1.00',
            'stock'        => 1,
            'publisher_id' => $otherBook->publisher_id,
        ])
        ->assertForbidden();
});

// ─── Author: Book Detail ──────────────────────────────────────────────────────

test('author can view their own book detail', function () {
    [$user, $author] = makeAuthorUser();
    $book = Book::factory()->create(['author_id' => $author->id]);

    $this->actingAs($user)
        ->get("/author/books/{$book->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('author/books/show')
            ->where('book.id', $book->id)
        );
});

test('author cannot view another authors book detail', function () {
    [$user] = makeAuthorUser();
    $otherBook = Book::factory()->create();

    $this->actingAs($user)
        ->get("/author/books/{$otherBook->id}")
        ->assertForbidden();
});
