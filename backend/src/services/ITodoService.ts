import { TodoItem } from "../models/TodoItem"
import { ReqCreateTodo, ReqUpdateTodo } from "../models/request/ReqTodoModels"

export interface ITodoService {
  getAllTodoByUserId(userId: string): Promise<TodoItem[]>
  getByTodoId(userId: string, todoId: string): Promise<TodoItem>
  createNewTodo(req: ReqCreateTodo): Promise<TodoItem>
  updateTodo(req: ReqUpdateTodo): Promise<TodoItem>
  deleteTodo(userId: string, todoId: string): Promise<void>
  getSignedUrl(todoId: string): Promise<string>
}
