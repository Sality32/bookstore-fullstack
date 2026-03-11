<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class BookController extends Controller
{
    private function getPublisher(): Publisher
    {
        $publisher = Publisher::where('user_id', Auth::id())->first();

        if (! $publisher) {
            abort(403, 'Your account is not linked to a publisher profile. Please contact the administrator.');
        }

        return $publisher;
    }

    public function index(Request $request): Response
    {
        $publisher = $this->getPublisher();

        $query = $publisher->books()->with('author:id,name')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        return inertia('publisher/books', [
            'publisher' => $publisher->only('id', 'name', 'description'),
            'books'     => $query->paginate(10)->withQueryString(),
            'filters'   => $request->only('search'),
        ]);
    }
}
