export const securityHeaders: [string, string][] = [
  ["X-DNS-Prefetch-Control", "off"],
  ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-XSS-Protection", "0"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"],
];

type CspDirective =
  | "defaultSrc"
  | "scriptSrc"
  | "styleSrc"
  | "imgSrc"
  | "fontSrc"
  | "connectSrc"
  | "mediaSrc"
  | "objectSrc"
  | "frameSrc"
  | "baseUri"
  | "formAction"
  | "frameAncestors"
  | "upgradeInsecureRequests";

type CspDirectives = Partial<Record<CspDirective, string[]>>;

const defaultSources: CspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "blob:"],
  fontSrc: ["'self'", "data:"],
  connectSrc: ["'self'"],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: [],
};

function kebabCase(str: string): string {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export function getStrictCSP(options?: { nonce?: string; directives?: CspDirectives }): string {
  const { nonce, directives } = options ?? {};
  const merged: CspDirectives = { ...defaultSources };

  if (directives) {
    for (const [key, value] of Object.entries(directives) as [CspDirective, string[]][]) {
      if (value && value.length > 0) {
        const existing = merged[key] ?? [];
        merged[key] = [...existing, ...value];
      }
    }
  }

  if (nonce) {
    const nonceValue = `'nonce-${nonce}'`;
    const currentScript = merged.scriptSrc ?? [];
    merged.scriptSrc = [...currentScript, nonceValue];
    const currentStyle = merged.styleSrc ?? [];
    merged.styleSrc = [...currentStyle, nonceValue];
  }

  const parts: string[] = [];

  for (const [directive, sources] of Object.entries(merged) as [CspDirective, string[]][]) {
    if (sources.length === 0 && directive !== "upgradeInsecureRequests") {
      continue;
    }

    if (directive === "upgradeInsecureRequests") {
      parts.push("upgrade-insecure-requests");
    } else {
      parts.push(`${kebabCase(directive)} ${sources.join(" ")}`);
    }
  }

  return parts.join("; ");
}
