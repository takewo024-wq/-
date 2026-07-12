This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment variables

Create `.env.local` with:

```
ANTHROPIC_API_KEY=sk-ant-...
NOTE_SESSION_COOKIE=note_gql_auth_token=...; _note_session_v5=...
```

`NOTE_SESSION_COOKIE` is used by the 下書き管理 (`/drafts`) page to post drafts to
note.com as note drafts (not published). note.com has no official API, so this
uses the unofficial [`note-api-client`](https://www.npmjs.com/package/note-api-client)
package driven by your logged-in browser session cookie. To obtain it:

1. Log in to note.com in your browser.
2. Open DevTools → Network (or Application → Cookies) for note.com.
3. Copy the full `Cookie` request header value (or combine the
   `note_gql_auth_token` and `_note_session_v5` cookies as `name=value; name=value`).
4. Paste it as `NOTE_SESSION_COOKIE`.

This is an unofficial, reverse-engineered integration. note.com can change or
block it at any time, and using it may be against note's Terms of Service —
use at your own risk, and treat the cookie value as a secret (never commit it).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
