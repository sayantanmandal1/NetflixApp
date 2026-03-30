const API_BASE = "/api";

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("netflix_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth
export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string } }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ email, password }) }
      ),
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      ),
    me: () => request<{ id: string; email: string }>("/auth/me"),
  },

  profiles: {
    list: () =>
      request<
        {
          id: string;
          name: string;
          avatar_url: string;
          is_kids: boolean;
        }[]
      >("/profiles"),
    create: (data: { name: string; avatar_url: string; is_kids: boolean }) =>
      request("/profiles", { method: "POST", body: JSON.stringify(data) }),
    update: (
      id: string,
      data: { name: string; avatar_url: string; is_kids: boolean }
    ) =>
      request(`/profiles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/profiles/${id}`, { method: "DELETE" }),
  },

  favorites: {
    list: (profileId: string) =>
      request<
        { id: string; tmdb_id: number; media_type: string; added_at: string }[]
      >(`/profiles/${profileId}/favorites`),
    add: (profileId: string, tmdbId: number, mediaType: string) =>
      request(`/profiles/${profileId}/favorites`, {
        method: "POST",
        body: JSON.stringify({ tmdb_id: tmdbId, media_type: mediaType }),
      }),
    remove: (profileId: string, tmdbId: number, mediaType: string) =>
      request(
        `/profiles/${profileId}/favorites/${tmdbId}?media_type=${mediaType}`,
        { method: "DELETE" }
      ),
    check: (profileId: string, tmdbId: number, mediaType: string) =>
      request<{ is_favorite: boolean }>(
        `/profiles/${profileId}/favorites/${tmdbId}/check?media_type=${mediaType}`
      ),
  },
};
