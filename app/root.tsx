import { Outlet, Scripts, ScrollRestoration } from "react-router";

export function meta() {
  return [{ title: "React Router SSR on ECS" }];
}

export default function Root() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>
        <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
          <a href="/">Home</a> &nbsp;|&nbsp; <a href="/about">About</a>
        </header>
        <main style={{ padding: 16 }}>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
