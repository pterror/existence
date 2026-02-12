const PAGES_ORIGIN = "https://existence.pages.dev";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Redirect /existence to /existence/ so relative paths resolve correctly
    if (url.pathname === "/existence") {
      url.pathname = "/existence/";
      return Response.redirect(url.toString(), 301);
    }

    // Strip /existence prefix and fetch from Pages
    const path = url.pathname.replace(/^\/existence/, "") || "/";
    const pagesUrl = new URL(path + url.search, PAGES_ORIGIN);

    const response = await fetch(pagesUrl, {
      method: request.method,
      headers: request.headers,
    });

    // Pass through with immutable headers copied
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  },
};
