export interface User {
  id?: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface UserWithPassword extends User {
  password: string;
}
