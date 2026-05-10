import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = createHash('sha256').update('layers2026admin' + 'layers-admin-salt').digest('hex');

export async function POST(request: NextRequest) {
  try {
    let username = '';
    let password = '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username || '';
      password = body.password || '';
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      username = params.get('username') || '';
      password = params.get('password') || '';
    }

    if (!username || !password) {
      const html = `<!DOCTYPE html><html><body><p>Missing credentials. <a href="/admin/login">Back to login</a></p></body></html>`;
      return new Response(html, { status: 400, headers: { 'content-type': 'text/html' } });
    }

    const passHash = createHash('sha256').update(password + 'layers-admin-salt').digest('hex');

    if (username === ADMIN_USER && passHash === ADMIN_PASS_HASH) {
      // Return HTML page that auto-redirects via JS + sets cookie
      // Cookie is httpOnly but accessible via the browser for subsequent requests
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Redirecting...</title>
</head>
<body>
  <p>Login successful. Redirecting...</p>
  <script>
    // Set cookie via JS (for redirect page, cookie must be accessible to browser)
    document.cookie = "layers_admin=1; path=/; max-age=${60 * 60 * 24}; SameSite=Lax";
    window.location.replace('/admin/creators');
  </script>
</body>
</html>`;
      const response = new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
      return response;
    }

    const html = `<!DOCTYPE html>
<html>
<body>
  <p>Invalid credentials. <a href="/admin/login">Back to login</a></p>
  <script>setTimeout(() => window.location.replace('/admin/login'), 2000);</script>
</body>
</html>`;
    return new Response(html, { status: 401, headers: { 'content-type': 'text/html' } });
  } catch (err) {
    console.error(err);
    const html = `<!DOCTYPE html><html><body><p>Server error. <a href="/admin/login">Back to login</a></p></body></html>`;
    return new Response(html, { status: 500, headers: { 'content-type': 'text/html' } });
  }
}