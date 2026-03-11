<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    use PasswordValidationRules;

    public function index(): \Inertia\Response
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('admin/users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'role'     => ['required', 'in:admin,author,publisher,user'],
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ]);

        User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'role'              => $validated['role'],
            'password'          => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'User created successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
