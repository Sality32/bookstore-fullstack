<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $stats = [];

        if ($request->user()->isAdmin()) {
            $stats = [
                'total_users'   => User::count(),
                'admin_users'   => User::where('role', 'admin')->count(),
                'regular_users' => User::where('role', 'user')->orWhere('role', 'author')->orWhere('role', 'publisher')->count(),
            ];
        }

        return inertia('dashboard', [
            'stats' => $stats,
        ]);
    }
}
