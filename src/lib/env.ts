import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().min(1, "VITE_API_URL is required"),
  VITE_FIREBASE_API_KEY: z.string().min(1, "VITE_FIREBASE_API_KEY is required"),
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "VITE_FIREBASE_AUTH_DOMAIN is required"),
  VITE_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "VITE_FIREBASE_PROJECT_ID is required"),
  VITE_FIREBASE_APP_ID: z.string().min(1, "VITE_FIREBASE_APP_ID is required"),
});

// import.meta.env is typed as any by Vite — cast to a safe Record before parsing
const rawEnv = import.meta.env as Record<string, unknown>;

const parsed = envSchema.safeParse({
  VITE_API_URL: rawEnv["VITE_API_URL"],
  VITE_FIREBASE_API_KEY: rawEnv["VITE_FIREBASE_API_KEY"],
  VITE_FIREBASE_AUTH_DOMAIN: rawEnv["VITE_FIREBASE_AUTH_DOMAIN"],
  VITE_FIREBASE_PROJECT_ID: rawEnv["VITE_FIREBASE_PROJECT_ID"],
  VITE_FIREBASE_APP_ID: rawEnv["VITE_FIREBASE_APP_ID"],
});

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.message).join(", ");
  throw new Error(`[env] Missing or invalid environment variables: ${missing}`);
}

export const env = parsed.data;
