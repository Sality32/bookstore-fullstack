<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
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

    public function index(): Response
    {
        $publisher = $this->getPublisher();

        return inertia('publisher/books', [
            'publisher' => $publisher->only('id', 'name', 'description'),
            'books'     => $publisher->books()
                ->with('author:id,name')
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }
}
