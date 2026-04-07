# Application Tracker

A full-stack web application for tracking your job applications — keep tabs on where you've applied, the current status, and generate reports on your progress.

**Live site:** [applikasjonsportal.no](https://applikasjonsportal.no) <!-- update if URL differs -->

---

## Features

- Add, edit, and delete job applications
- Track application status (Applied, Interview, Offer, Rejected, etc.)
- Filter and search applications
- Statistics dashboard with status breakdowns
- Generate application reports
- User authentication (register, login, JWT + refresh tokens)
- Responsive design — works on mobile and desktop

---

## Tech Stack

### Frontend

| Tool                                                                           | Purpose                    |
| ------------------------------------------------------------------------------ | -------------------------- |
| [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | UI framework               |
| [Vite](https://vitejs.dev/)                                                    | Build tool & dev server    |
| [Tailwind CSS](https://tailwindcss.com/)                                       | Styling                    |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)    | Component library          |
| [React Router](https://reactrouter.com/)                                       | Client-side routing        |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)      | Form handling & validation |

### Backend

| Tool                                                                                                    | Purpose         |
| ------------------------------------------------------------------------------------------------------- | --------------- |
| [ASP.NET Core 8](https://learn.microsoft.com/en-us/aspnet/core/)                                        | REST API        |
| [Entity Framework Core 8](https://learn.microsoft.com/en-us/ef/core/)                                   | ORM             |
| [PostgreSQL](https://www.postgresql.org/)                                                               | Database        |
| [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) | User management |
| [JWT Bearer](https://jwt.io/)                                                                           | Authentication  |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/))
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Application-Tracker.git
cd Application-Tracker
```

### 2. Backend setup

```bash
cd server
```

Create an `appsettings.Development.json` (already gitignored) with your local database connection:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=apptracker;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Key": "your-super-secret-key-at-least-32-chars",
    "Issuer": "ApplicationTracker",
    "Audience": "ApplicationTrackerUsers"
  }
}
```

Apply migrations and start the API:

```bash
dotnet ef database update
dotnet run
```

The API will be available at `https://localhost:5001`.

### 3. Frontend setup

```bash
cd frontend
npm install      # or: bun install
npm run dev      # or: bun dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
Application-Tracker/
├── frontend/               # React + TypeScript frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React context (auth, etc.)
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page-level components
│       └── types/          # TypeScript types
└── server/                 # ASP.NET Core backend
    ├── Controllers/        # API endpoints
    ├── Data/               # EF Core DbContext
    ├── Migrations/         # Database migrations
    └── Models/             # Entity models & DTOs
```

---

## Running Tests

```bash
cd frontend
npm run test
```

---

## Contributing

Contributions are welcome! Whether it's a bug fix, a new feature, or an improvement to the docs — all PRs are appreciated.

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

If you have an idea or found a bug, feel free to [open an issue](../../issues) first so we can discuss it.

---

## License

This project is open source and available under the [MIT License](LICENSE).
