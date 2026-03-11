<?php

namespace Database\Factories;

use App\Models\Publisher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Publisher>
 */
class PublisherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'        => fake()->company(),
            'slug'        => fake()->unique()->slug(),
            'description' => fake()->optional()->sentence(),
            'address'     => fake()->optional()->address(),
            'website'     => fake()->optional()->url(),
            'user_id'     => null,
        ];
    }
}
