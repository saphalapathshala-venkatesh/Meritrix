const REQUIRED_RAZORPAY_KEYS = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

let _cachedConfig: RazorpayConfig | null = null;

function checkRazorpayEnv(): { config: RazorpayConfig | null; missing: string[] } {
  if (_cachedConfig) return { config: _cachedConfig, missing: [] };

  const missing: string[] = [];
  for (const key of REQUIRED_RAZORPAY_KEYS) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    return { config: null, missing };
  }

  _cachedConfig = {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
  };
  return { config: _cachedConfig, missing: [] };
}

export function getRazorpayConfig(): RazorpayConfig {
  const { config, missing } = checkRazorpayEnv();
  if (!config) {
    throw new Error(
      `Razorpay configuration incomplete. Missing environment variables: ${missing.join(", ")}. ` +
      `Set these in your Replit Secrets before using payment features.`
    );
  }
  return config;
}

export function isRazorpayConfigured(): { configured: boolean; missing: string[] } {
  const { config, missing } = checkRazorpayEnv();
  return { configured: !!config, missing };
}
