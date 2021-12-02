import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getAllTodoItems(): Promise<TodoItem[]> {
  return todoAccess.getAllTodoItems()
}

export async function createTodoItem(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodoItem({
    todoId: itemId,
    userId: userId,
    done: false,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString()
  })
}

export async function updateTodoItem(
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string
  ): Promise<TodoUpdate> {
  
    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
  
    return await todoAccess.updateTodoItem({
      todoId: itemId,
      userId: userId,
      done: false,
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      createdAt: new Date().toISOString()
    })
  }