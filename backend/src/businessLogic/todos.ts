import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoDelete } from '../models/TodoDelete'
import { UploadUrl } from '../models/UploadUrl'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getTodosForUser(
    userId: string
): Promise<TodoItem[]> {
  return await todoAccess.getTodosForUser(userId)
}

export async function createTodoItem(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  return await todoAccess.createTodoItem({
    todoId,
    userId,
    done: false,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString()
  })
}

export async function updateTodoItem(
    updateTodoRequest: UpdateTodoRequest,
    userId: string,
    todoId: string
): Promise<TodoUpdate> {
  return await todoAccess.updateTodoItem({
    todoId,
    userId,
    done: false,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    createdAt: new Date().toISOString()
  })
}

export async function deleteTodoItem(todoId: string, userId: string): Promise<TodoDelete> {
  return await todoAccess.deleteTodoItem(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<UploadUrl> {
  return await todoAccess.createAttachmentPresignedUrl(todoId, userId)
}