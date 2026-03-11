<?php

use App\Http\Controllers\Admin\AuthorController as AdminAuthorController;
use App\Http\Controllers\Admin\BookController as AdminBookController;
use App\Http\Controllers\Admin\PublisherController as AdminPublisherController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Author\BookController as AuthorBookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Publisher\BookController as PublisherBookController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Authenticated routes (all roles)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Admin-only routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('users');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Authors
        Route::get('authors', [AdminAuthorController::class, 'index'])->name('authors');
        Route::post('authors', [AdminAuthorController::class, 'store'])->name('authors.store');
        Route::put('authors/{author}', [AdminAuthorController::class, 'update'])->name('authors.update');
        Route::delete('authors/{author}', [AdminAuthorController::class, 'destroy'])->name('authors.destroy');

        // Publishers
        Route::get('publishers', [AdminPublisherController::class, 'index'])->name('publishers');
        Route::post('publishers', [AdminPublisherController::class, 'store'])->name('publishers.store');
        Route::put('publishers/{publisher}', [AdminPublisherController::class, 'update'])->name('publishers.update');
        Route::delete('publishers/{publisher}', [AdminPublisherController::class, 'destroy'])->name('publishers.destroy');

        // Books
        Route::get('books', [AdminBookController::class, 'index'])->name('books');
        Route::get('books/{book}', [AdminBookController::class, 'show'])->name('books.show');
        Route::post('books', [AdminBookController::class, 'store'])->name('books.store');
        Route::put('books/{book}', [AdminBookController::class, 'update'])->name('books.update');
        Route::delete('books/{book}', [AdminBookController::class, 'destroy'])->name('books.destroy');
    });

// Author-only routes
Route::middleware(['auth', 'verified', 'role:author'])
    ->prefix('author')
    ->name('author.')
    ->group(function () {
        Route::get('books', [AuthorBookController::class, 'index'])->name('books');
        Route::get('books/{book}', [AuthorBookController::class, 'show'])->name('books.show');
        Route::post('books', [AuthorBookController::class, 'store'])->name('books.store');
        Route::put('books/{book}', [AuthorBookController::class, 'update'])->name('books.update');
        Route::delete('books/{book}', [AuthorBookController::class, 'destroy'])->name('books.destroy');
    });

// Publisher-only routes
Route::middleware(['auth', 'verified', 'role:publisher'])
    ->prefix('publisher')
    ->name('publisher.')
    ->group(function () {
        Route::get('books', [PublisherBookController::class, 'index'])->name('books');
    });

require __DIR__.'/settings.php';
