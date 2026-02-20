export interface AuthLogin {
  email: string;
  password: string;
}

/** Body sent to backend POST /auth/login when using Firebase Auth */
export interface FirebaseLoginBody {
  idToken: string;
}
