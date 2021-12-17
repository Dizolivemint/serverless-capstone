export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean,
  publicView: boolean,
  attachmentUrl?: string
}
