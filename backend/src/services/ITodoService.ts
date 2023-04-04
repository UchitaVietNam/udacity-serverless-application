import { TodoItem } from '../models/TodoItem'
import { ReqCreateTodo, ReqUpdateTodo } from '../models/request/ReqTodoModels'

export interface ITodoService {
  getAllTodoByUserId(userId: string): Promise<TodoItem[]>
  getByTodoId(userId: string, todoId: string): Promise<TodoItem>
  createNewTodo(req: ReqCreateTodo): Promise<TodoItem>
  updateTodo(req: ReqUpdateTodo): Promise<TodoItem>
  deleteTodo(userId: string, todoId: string): Promise<void>
  updateAttachment(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<TodoItem>
  createAttachmentUrl(todoid: string): string
  getSignedUrl(todoId: string): Promise<string>
}
