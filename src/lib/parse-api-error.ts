type FirebaseErrorLike = { code: string; message?: string };

function isFirebaseError(err: unknown): err is FirebaseErrorLike {
  return (
    !!err &&
    typeof err === "object" &&
    "code" in err &&
    typeof (err as Record<string, unknown>).code === "string"
  );
}

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "This email is already registered. Try signing in.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/invalid-email": "Invalid email address.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/popup-blocked": "Popup was blocked. Please allow popups and try again.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
};

export function parseFirebaseError(err: unknown, fallback = "An error occurred. Please try again."): string {
  if (!isFirebaseError(err)) return fallback;
  return FIREBASE_AUTH_MESSAGES[err.code] ?? err.message ?? fallback;
}
