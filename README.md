# Intuition Next.js Template

A modern, feature-rich Next.js template with built-in GraphQL integration, React Query, and Tailwind CSS styling.

## Overview

- Built with Next.js 15, Turbopack, and 1UI components
- TypeScript for type safety and better developer experience
- GraphQL integration with automatic code generation for type-safe queries
- React Query for efficient data fetching and state management
- Tailwind CSS for utility-first styling
- Fully responsive design with accessibility features

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/next-1ui.git
cd next-1ui
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Generate GraphQL types and hooks:

```bash
pnpm codegen:build
# or
npm run codegen:build
```

4. Start the development server:

```bash
pnpm dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## GraphQL Integration Tutorial

This template includes a complete GraphQL integration with automatic code generation. Here's how to use it:

### 1. Understanding the Structure

The GraphQL integration is organized as follows:

- `src/lib/graphql/queries/` - Contains GraphQL query definitions (`.graphql` files)
- `src/lib/graphql/generated/` - Contains auto-generated TypeScript types and React hooks
- `src/lib/graphql/client.ts` - GraphQL client configuration
- `src/lib/graphql/constants.ts` - API endpoints and other constants
- `codegen.ts` - Configuration for GraphQL code generation

### 2. Finding Example Queries

For a comprehensive set of example queries to help you get started, visit the [Intuition GraphQL Examples documentation](https://tech.docs.intuition.systems/dev/graphql-examples). This resource provides:

- Ready-to-use example queries with fragments included
- Interactive Apollo Explorer links to experiment with each query
- Access to the Intuition GraphQL package with pre-built fragments, queries, and typesafe hooks

You can also explore the [Intuition TypeScript monorepo](https://github.com/0xIntuition/intuition-ts/tree/main/packages/graphql) for more examples and the official GraphQL package that can be integrated into your React/Node applications. It is structured in the same way as this template, but with fragments and queries already built out. **The `0xintuition/graphql` is already installed into this template, so you can leverage the generated types and hooks.**

### 3. Creating a New Query

1. Create a new `.graphql` file in the `src/lib/graphql/queries/` directory:

```graphql
# src/lib/graphql/queries/example.graphql
query ExampleQuery($id: ID!) {
  example(id: $id) {
    id
    name
    description
  }
}
```

2. Run the code generation:

```bash
pnpm codegen:build
```

This will generate TypeScript types and React Query hooks for your new query.

### 4. Using the Generated Hooks

After code generation, you can import and use the generated hooks in your components:

```tsx
import { useExampleQuery } from '@/lib/graphql'

function ExampleComponent() {
  const { data, isLoading, error } = useExampleQuery({ id: '123' }, { queryKey: ['example', '123'] })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{data?.example?.name}</h1>
      <p>{data?.example?.description}</p>
    </div>
  )
}
```

### 5. Example: Atoms with Tags Query

The template includes an example query for fetching atoms with tags. Here's how it works:

```tsx
// In your component:
const {
  data: atomsData,
  error,
  isLoading,
} = useAtomsWithTagsQuery(
  {
    where: {
      _and: [
        // Filter conditions
      ],
    },
    tagPredicateIds: ['3'],
    orderBy: [{ vault: { total_shares: 'desc' } }],
    verifiedPositionAddress: 'YOUR_ADDRESS',
  },
  {
    queryKey: ['AtomsWithTags', 'YOUR_ADDRESS', selectedTags],
  }
)
```

This query demonstrates several advanced features:

- Filtering with complex conditions
- Ordering results
- Parameterizing queries with variables
- Using React Query's caching with queryKey

## Development Workflow

### Code Generation

The template uses GraphQL Code Generator to create TypeScript types and React Query hooks from your GraphQL queries.

- **One-time generation**: `pnpm codegen:build`
- **Watch mode**: `pnpm codegen:watch` (automatically regenerates when queries change)

### Available Scripts

- `pnpm dev` - Start the development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check for code issues
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm typecheck` - Check TypeScript types
- `pnpm codegen:build` - Generate GraphQL types and hooks
- `pnpm codegen:watch` - Generate GraphQL types and hooks in watch mode

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
