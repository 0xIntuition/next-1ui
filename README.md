# Overview

- This is a barebones Next.js app that works with 1ui, Next 15, and Turbopack
- Add additional providers to `providers.tsx` -- this is already wrapping `layout.tsx`
- You can see the use of the `'use client'` directive in the `providers.tsx` and `page.tsx`
- Add pages directly to the `app` directory following Next's _app router_ conventions
- Theming is set up and pulls from `1ui` -- any Shad components or Tailwind you write will respect this theme
- Recommended to add Shad components via the CLI, run in the root of this directory
