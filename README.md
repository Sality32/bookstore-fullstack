# Bookstore Fullstack

A full-stack bookstore management system built with **Laravel 12** and **React 19** via **Inertia.js**. It features role-based access control, a full book catalogue, and a modern ShadCN/ui interface.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Laravel](https://laravel.com) | ^12.0 | PHP application framework |
| [Laravel Fortify](https://laravel.com/docs/fortify) | ^1.30 | Headless authentication backend |
| [Inertia.js (Laravel adapter)](https://inertiajs.com) | ^2.0 | Server-driven SPA bridge |
| [Laravel Wayfinder](https://github.com/laravel/wayfinder) | ^0.1.9 | Typed route helpers generator |
| [Pest PHP](https://pestphp.com) | ^4.4 | Testing framework |
| PHP | ^8.2 | Runtime |
| MySQL | any | Primary database |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | ^19.2 | UI library |
| [TypeScript](https://www.typescriptlang.org) | ^5.7 | Type-safe JavaScript |
| [Inertia.js (React adapter)](https://inertiajs.com) | ^2.3 | Client-side SPA adapter |
| [Vite](https://vitejs.dev) | ^7.0 | Build tool & dev server |
| [ShadCN/ui](https://ui.shadcn.com) | — | Component library (Radix UI primitives) |
| [Tailwind CSS](https://tailwindcss.com) | ^4.0 | Utility-first CSS framework |
| [Lucide React](https://lucide.dev) | ^0.475 | Icon library |
| [SweetAlert2](https://sweetalert2.github.io) | ^11.26 | Confirmation and toast dialogs |

---

## Authentication & Authorization

### Authentication — Laravel Fortify

Authentication is powered by **Laravel Fortify** (headless, no built-in views). Fortify handles the following features:

| Feature | Status |
|---|---|
| Login | ✅ Enabled |
| Registration | ✅ Enabled (admin creates accounts via Users page) |
| Password Reset | ✅ Enabled |

> **Note:** Public self-registration is intentionally disabled at the UI level. User accounts are created and managed by administrators from the Users management page.

**Rate limiting** is applied to login (`5 attempts/minute per IP+username`).

### Authorization — Role-Based Access Control (RBAC)

Every user has a `role` field (enum) with one of four values:

| Role | Description |
|---|---|
| `admin` | Full system access — manages users, authors, publishers, and all books |
| `author` | Manages only their own books (linked via `authors.user_id`) |
| `publisher` | Views their own catalogue (linked via `publishers.user_id`) |
| `user` | Authenticated access, dashboard only |

**Middleware:** `EnsureRole` (`app/Http/Middleware/EnsureRole.php`) is registered as the `role` alias. It checks `$request->user()->role` against one or more allowed roles, aborting with `403` if unauthorized.

```php
// Example route guard
Route::middleware(['auth', 'role:admin'])->group(...);
```

**Author ownership** is enforced at the controller level: `Author\BookController` resolves the authenticated user's linked `Author` profile and verifies `$book->author_id === $author->id` before allowing update/delete/show.

---

## Database Schema

```
users
├── id, name, email, email_verified_at
├── role (enum: admin | author | publisher | user)
└── password, remember_token, timestamps

authors
├── id, name, slug (unique)
├── bio (nullable), photo (nullable)
├── user_id (FK → users, nullable, unique)
└── timestamps

publishers
├── id, name, slug (unique)
├── description (nullable), address (nullable), website (nullable)
├── user_id (FK → users, nullable, unique)
└── timestamps

books
├── id, title, slug (unique)
├── description (nullable), isbn (nullable, unique)
├── price (decimal 10,2), stock (unsigned int)
├── cover_image (nullable), published_year (nullable)
├── author_id (FK → authors, cascade delete)
├── publisher_id (FK → publishers, cascade delete)
└── timestamps
```

---

## Menus & Navigation

The sidebar adapts dynamically based on the authenticated user's role.

### Admin
| Menu Item | URL | Description |
|---|---|---|
| Dashboard | `/dashboard` | User stats (total, admins, regular, verified) |
| Users | `/admin/users` | Create and delete user accounts |
| Authors | `/admin/authors` | Full CRUD for author profiles, link to user accounts |
| Publishers | `/admin/publishers` | Full CRUD for publisher profiles, link to user accounts |
| Books | `/admin/books` | Full CRUD for all books, search by title/ISBN, filter by author/publisher |

### Author
| Menu Item | URL | Description |
|---|---|---|
| Dashboard | `/dashboard` | Welcome banner |
| My Books | `/author/books` | Create, edit, delete, and view own books; search by title/ISBN |

### Publisher
| Menu Item | URL | Description |
|---|---|---|
| Dashboard | `/dashboard` | Welcome banner |
| My Catalog | `/publisher/books` | View all books belonging to their publisher |

### Regular User
| Menu Item | URL | Description |
|---|---|---|
| Dashboard | `/dashboard` | Welcome banner |

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **PHP** 8.2 or higher
- **Composer** 2.x
- **Node.js** 20+ and **npm** 10+
- **MySQL** 8.0+ (or MariaDB 10.6+)
- **Git**

---

## Getting Started on a New Device

### 1. Clone the repository

```bash
git clone https://github.com/Sality32/bookstore-fullstack.git
cd bookstore-fullstack
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node.js dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configure the database

Open `.env` and set your MySQL credentials:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bookstore
DB_USERNAME=root
DB_PASSWORD=your_password
```

Create the database manually in MySQL:

```sql
CREATE DATABASE bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Run migrations and seed demo data

```bash
php artisan migrate --seed
```

This creates all tables and seeds the following demo accounts (all passwords are `password`):

| Name | Email | Role |
|---|---|---|
| Admin User | `admin@example.com` | admin |
| Jane Doe | `jane@example.com` | author |
| John Smith | `john@example.com` | author |
| Penguin Books | `penguin@example.com` | publisher |
| Oxford Press | `oxford@example.com` | publisher |

### 7. Start the development server

Run all services (Laravel, Vite, queue listener, and log viewer) in one command:

```bash
composer run dev
```

Or start them individually:

```bash
# Terminal 1 — Laravel backend
php artisan serve

# Terminal 2 — Vite frontend (HMR)
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Building for Production

```bash
npm run build
php artisan optimize
```

---

## Running Tests

```bash
php artisan test
```


---

## Useful Commands

| Command | Description |
|---|---|
| `composer run dev` | Start all dev services concurrently |
| `php artisan migrate:fresh --seed` | Reset DB and re-seed demo data |
| `php artisan tinker` | Interactive REPL |
| `php artisan route:list` | List all registered routes |
| `npm run build` | Build frontend assets for production |
| `npm run types:check` | TypeScript type checking |
| `npm run lint` | Auto-fix ESLint issues |
| `npm run format` | Auto-format with Prettier |
