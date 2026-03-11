<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\GeneratesSlug;
use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AuthorController extends Controller
{
    use GeneratesSlug;

    public function index(Request $request): Response
    {
        $query = Author::withCount('books')
            ->with('user:id,name,email')
            ->latest();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        return inertia('admin/authors', [
            'authors'        => $query->paginate(15)->withQueryString(),
            'availableUsers' => User::where('role', 'author')
                ->select('id', 'name', 'email')
                ->get(),
            'filters'        => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (in_array($request->input('user_id'), ['none', ''], true)) {
            $request->merge(['user_id' => null]);
        }

        $data = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'bio'     => ['nullable', 'string', 'max:5000'],
            'user_id' => [
                'nullable',
                'exists:users,id',
                function ($attr, $val, $fail) {
                    if ($val && Author::where('user_id', $val)->exists()) {
                        $fail('This user is already linked to another author profile.');
                    }
                },
            ],
        ]);

        Author::create([...$data, 'slug' => $this->uniqueSlug($data['name'], Author::class)]);

        return back()->with('success', 'Author created successfully.');
    }

    public function update(Request $request, Author $author): RedirectResponse
    {
        if (in_array($request->input('user_id'), ['none', ''], true)) {
            $request->merge(['user_id' => null]);
        }

        $data = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'bio'     => ['nullable', 'string', 'max:5000'],
            'user_id' => [
                'nullable',
                'exists:users,id',
                function ($attr, $val, $fail) use ($author) {
                    if ($val && Author::where('user_id', $val)->where('id', '!=', $author->id)->exists()) {
                        $fail('This user is already linked to another author profile.');
                    }
                },
            ],
        ]);

        $author->update([...$data, 'slug' => $this->uniqueSlug($data['name'], Author::class, $author->id)]);

        return back()->with('success', 'Author updated successfully.');
    }

    public function destroy(Author $author): RedirectResponse
    {
        if ($author->books()->exists()) {
            return back()->with('error', 'Cannot delete author — they still have books. Remove the books first.');
        }

        $author->delete();

        return back()->with('success', 'Author deleted successfully.');
    }
}
