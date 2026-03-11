<?php

namespace App\Concerns;

use Illuminate\Support\Str;

trait GeneratesSlug
{
    protected function uniqueSlug(string $name, string $model, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i    = 1;

        while ($model::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
