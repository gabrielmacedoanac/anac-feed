import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { gerarFeeds } from "./core/feed.ts";

const feeds = await gerarFeeds();

serve((req) => {
  const url = new URL(req.url);

  switch (url.pathname) {
    case "/":
    case "/html":
      return new Response(feeds.html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });

    case "/json":
      return new Response(JSON.stringify(feeds.json, null, 2), {
        headers: { "content-type": "application/json" },
      });

    case "/rss":
      return new Response(feeds.rss, {
        headers: { "content-type": "application/rss+xml; charset=utf-8" },
      });

    case "/atom":
      return new Response(feeds.atom, {
        headers: { "content-type": "application/atom+xml; charset=utf-8" },
      });

    default:
      return new Response("404 - Not Found", { status: 404 });
  }
});