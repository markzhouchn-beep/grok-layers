/**
 * Layers API Client
 * TODO: Replace VITE_API_BASE with actual production URL when deploying
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Product {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  artistName: string;
  category?: string;
  status?: string;
}

export interface Artist {
  id: string;
  name: string;
  artistName: string;
  avatar?: string;
  bio?: string;
  plan: string;
}

export interface APIError {
  message: string;
  code?: number;
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: Artist }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { username: string; email: string; password: string; artist_name: string }) =>
    apiFetch<{ token: string; user: Artist }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Products
export const products = {
  list: (params?: { category?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) =>
    apiFetch<Product>(`/api/products/${id}`),
};

// Artworks
export const artworks = {
  list: (params?: { status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<Product[]>(`/api/artworks${qs ? `?${qs}` : ''}`);
  },

  submit: (data: FormData) =>
    fetch(`${API_BASE}/api/artworks/upload`, {
      method: 'POST',
      body: data,
      credentials: 'include',
    }).then((r) => r.json()),
};

// Vendor application
export const vendor = {
  apply: (data: { name: string; email: string; portfolio?: string; art_style?: string }) =>
    apiFetch<{ success: boolean }>('/api/vendor/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
