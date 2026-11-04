# AEGIS-GRC

Aegis GRC (Governance, Risk, and Compliance) web application built with modern web technologies.

## Features

- **Risk Management**: Track and manage organizational risks
- **Evidence Management**: Collect and organize compliance evidence
- **Framework Management**: Manage control frameworks and mappings
- **Task Management**: Assign and track remediation tasks
- **User Authentication**: Secure login and profile management
- **Role-Based Access**: Organization-level permissions and roles

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui
- **Backend**: Supabase (Auth, Database, Realtime)
- **HTTP**: Axios for API calls
- **State Management**: React Query

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure Supabase project credentials
3. Set up OAuth providers if needed

## Project Structure

- `src/` - Source code
- `src/pages/` - Page components
- `src/components/` - UI components
- `src/hooks/` - Custom React hooks
- `src/services/` - API services
- `src/lib/` - Utility functions and types

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run linter |
| `npm run preview` | Preview production build |

## License

[MIT](LICENSE) or specify your license