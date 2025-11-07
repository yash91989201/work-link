export const fetchClient = (
  url: URL | RequestInfo,
  init: RequestInit | undefined
) =>
  fetch(url, {
    ...init,
    credentials: "include",
  });
