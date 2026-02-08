export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created_at?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}
