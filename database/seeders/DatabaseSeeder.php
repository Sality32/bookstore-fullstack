<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin user
        User::factory()->create([
            'name'  => 'Admin User',
            'email' => 'admin@example.com',
            'role'  => 'admin',
        ]);

        // Author users
        $authorUser1 = User::factory()->create([
            'name'  => 'Jane Doe',
            'email' => 'jane@example.com',
            'role'  => 'author',
        ]);
        $authorUser2 = User::factory()->create([
            'name'  => 'John Smith',
            'email' => 'john@example.com',
            'role'  => 'author',
        ]);

        // Publisher users
        $publisherUser1 = User::factory()->create([
            'name'  => 'Penguin Books',
            'email' => 'penguin@example.com',
            'role'  => 'publisher',
        ]);
        $publisherUser2 = User::factory()->create([
            'name'  => 'Oxford Press',
            'email' => 'oxford@example.com',
            'role'  => 'publisher',
        ]);

        // Author profiles linked to users
        $author1 = \App\Models\Author::create([
            'name'    => 'Jane Doe',
            'slug'    => 'jane-doe',
            'bio'     => 'Award-winning fiction author with over 20 novels published.',
            'user_id' => $authorUser1->id,
        ]);
        $author2 = \App\Models\Author::create([
            'name'    => 'John Smith',
            'slug'    => 'john-smith',
            'bio'     => 'Technology writer and software engineer.',
            'user_id' => $authorUser2->id,
        ]);

        // Publisher profiles linked to users
        $publisher1 = \App\Models\Publisher::create([
            'name'        => 'Penguin Books',
            'slug'        => 'penguin-books',
            'description' => 'One of the largest English-language publishers.',
            'website'     => 'https://www.penguin.com',
            'user_id'     => $publisherUser1->id,
        ]);
        $publisher2 = \App\Models\Publisher::create([
            'name'        => 'Oxford Press',
            'slug'        => 'oxford-press',
            'description' => 'Academic and educational publisher.',
            'website'     => 'https://www.oup.com',
            'user_id'     => $publisherUser2->id,
        ]);

        // Sample books
        \App\Models\Book::create([
            'title'          => 'The Midnight Garden',
            'slug'           => 'the-midnight-garden',
            'description'    => 'A captivating story of mystery and magic.',
            'isbn'           => '978-0-00-000001-0',
            'price'          => 14.99,
            'stock'          => 50,
            'published_year' => 2023,
            'author_id'      => $author1->id,
            'publisher_id'   => $publisher1->id,
        ]);
        \App\Models\Book::create([
            'title'          => 'Code & Craft',
            'slug'           => 'code-and-craft',
            'description'    => 'Mastering software engineering principles.',
            'isbn'           => '978-0-00-000002-7',
            'price'          => 39.99,
            'stock'          => 30,
            'published_year' => 2024,
            'author_id'      => $author2->id,
            'publisher_id'   => $publisher2->id,
        ]);

        // Extra regular users
        User::factory(5)->create();
    }
}
