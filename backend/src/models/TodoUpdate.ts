export interface TodoUpdate {
  userId: string
  todoId: string
  name: string
  dueDate: string
  done: boolean
}

export interface TodoUpdateImage {
  userId: string
  todoId: string
  attachmentUrl: string
}
