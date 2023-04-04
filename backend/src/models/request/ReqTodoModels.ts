/** Create a new Todo Item request model */
export interface ReqCreateTodo {
  userId: string
  name: string
  dueDate: string
  attachmentUrl?: string
}

/** Update a Todo Item request model */
export interface ReqUpdateTodo {
  userId: string
  todoId: string
  name: string
  dueDate: string
  done: boolean
}
