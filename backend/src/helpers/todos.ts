import { TodoAccess } from './todoAccess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { PubItem } from '../models/PubItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

import { TodoDelete } from '../models/TodoDelete'
import { UploadUrl } from '../models/UploadUrl'

const todoAccess = new TodoAccess()
const attachmentUtil = new AttachmentUtils()

export async function getTodosForUser(
    userId: string
): Promise<TodoItem[]> {
  const todos = await todoAccess.getTodosForUser(userId)

  if (todos.length < 1) createError(404, 'No todos found')

  return todos
}

export async function getPublicTodos(
  userId: string
): Promise<PubItem[]> {

if (!userId) {
  createError(403, 'Please log in first')
  return [
    {
      todoId: 'unknown',
      createdAt: '',
      name: 'Please login first',
      isPublic: 'x'
    }
  ]
}

const todos = await todoAccess.getPublicTodos()

if (todos.length < 1) createError(404, 'No todos found')

return todos
}

export async function getTodo(
  userId: string,
  todoId: string
): Promise<TodoItem> {
const todo = await todoAccess.getTodo(userId, todoId)

if (!todo) createError(404, 'No todo found')

return todo
}

export async function createTodoItem(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  const todo = await todoAccess.createTodoItem({
    todoId,
    userId,
    done: false,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString()
  })

  if (!todo) createError(500, 'Unable to create todo item')
  
  return todo
}

export async function updateTodoItem(
    updateTodoRequest: UpdateTodoRequest,
    userId: string,
    todoId: string
): Promise<UpdateTodoRequest> {
  const updatedTodoItem = await todoAccess.updateTodoItem({
    todoId,
    userId,
    done: updateTodoRequest.done,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    isPublic: updateTodoRequest.isPublic
  })

  if (updateTodoRequest != updatedTodoItem) createError(500, 'Unable to update todo item')

  return updatedTodoItem
}

export async function deleteTodoItem(todoId: string, userId: string): Promise<TodoDelete> {
  return await todoAccess.deleteTodoItem(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<UploadUrl> {
  if (!userId) createError(500, 'Valid user ID required')

  const presignedUrl = await attachmentUtil.createAttachmentPresignedUrl(todoId)
  
  todoAccess.addAttachmentUrl(todoId, userId)

  return presignedUrl
}