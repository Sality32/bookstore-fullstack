<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\GeneratesSlug;
use App\Http\Controllers\Controller;
use App\Models\Publisher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PublisherController extends Controller
{
    use GeneratesSlug;

    public function index(Request $request): Response
    {
        $query = Publisher::withCount('books')
            ->with('user:id,name,email')
            ->latest();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        return inertia('admin/publishers', [
            'publishers'     => $query->paginate(5)->withQueryString(),
            'availableUsers' => User::where('role', 'publisher')
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
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'address'     => ['nullable', 'string', 'max:500'],
            'website'     => ['nullable', 'url', 'max:255'],
            'user_id'     => [
                'nullable',
                'exists:users,id',
                function ($attr, $val, $fail) {
                    if ($val && Publisher::where('user_id', $val)->exists()) {
                        $fail('This user is already linked to another publisher profile.');
                    }
                },
            ],
        ]);

        Publisher::create([...$data, 'slug' => $this->uniqueSlug($data['name'], Publisher::class)]);

        return back()->with('success', 'Publisher created successfully.');
    }

    public function update(Request $request, Publisher $publisher): RedirectResponse
    {
        if (in_array($request->input('user_id'), ['none', ''], true)) {
            $request->merge(['user_id' => null]);
        }

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'address'     => ['nullable', 'string', 'max:500'],
            'website'     => ['nullable', 'url', 'max:255'],
            'user_id'     => [
                'nullable',
                'exists:users,id',
                function ($attr, $val, $fail) use ($publisher) {
                    if ($val && Publisher::where('user_id', $val)->where('id', '!=', $publisher->id)->exists()) {
                        $fail('This user is already linked to another publisher profile.');
                    }
                },
            ],
        ]);

        $publisher->update([...$data, 'slug' => $this->uniqueSlug($data['name'], Publisher::class, $publisher->id)]);

        return back()->with('success', 'Publisher updated successfully.');
    }

    public function destroy(Publisher $publisher): RedirectResponse
    {
        if ($publisher->books()->exists()) {
            return back()->with('error', 'Cannot delete publisher — they still have books. Remove the books first.');
        }

        $publisher->delete();

        return back()->with('success', 'Publisher deleted successfully.');
    }
}
