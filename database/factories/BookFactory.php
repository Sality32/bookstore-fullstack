<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'          => fake()->sentence(3),
            'slug'           => fake()->unique()->slug(),
            'description'    => fake()->optional()->paragraph(),
            'isbn'           => fake()->unique()->isbn13(),
            'price'          => fake()->randomFloat(2, 5, 100),
            'stock'          => fake()->numberBetween(0, 500),
            'cover_image'    => null,
            'published_year' => fake()->year(),
            'author_id'      => \App\Models\Author::factory(),
            'publisher_id'   => \App\Models\Publisher::factory(),
        ];
    }
}
