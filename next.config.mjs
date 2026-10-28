/** @type {import('next').NextConfig} */

// Defence-in-depth headers applied to every response. frame-ancestors/X-Frame-Options stop
// clickjacking of the admin pages; nosniff stops MIME confusion; the Permissions-Policy keeps
// the microphone available (the session recorder / voice assistant need it) while denying the
// rest. The CSP is intentionally non-breaking for the App Router; tightening script-src with
// nonces is a sensible follow-up.
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
];

const nextConfig = {
  images: {
    // Only optimise images from hosts we control or trust. Previously this was "**" (any https
    // host), which turns the image optimiser into an open proxy and is the path several Next image
    // CVEs exploit. Add hosts here if admins paste image URLs from elsewhere.
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.upgrad.com" },
      { protocol: "https", hostname: "media.licdn.com" },
    ],
    // SVGs can carry scripts; keep the optimiser from serving them inline.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
