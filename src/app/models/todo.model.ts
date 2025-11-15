import { User } from "./user.model";

export interface Todo {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}