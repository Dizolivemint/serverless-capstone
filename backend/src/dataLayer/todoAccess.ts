import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoDelete } from '../models/TodoDelete'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('DB Access')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getTodosForUser(userId): Promise<TodoItem[]> {
    logger.info(`Getting all todos for user id ${userId}`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: userId,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodoItem(todo: TodoItem): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key:{
        "todoId": todo.todoId,
        "userId": todo.userId
      },
      UpdateExpression: "set name = :n, dueDate=:d, done=:c",
      ExpressionAttributeValues:{
        ":n": todo.name,
        ":d": todo.dueDate,
        ":c": todo.done
      },
      ReturnValues:"UPDATED_NEW"
    }).promise()

    return todo
  }
  
  async deleteTodoItem(todoId: string, userId: string): Promise<TodoDelete> {
    const todo = {
      todoId,
      userId
    }

    await this.docClient.update({
      TableName: this.todosTable,
      Key:{
        "todoId": todo.todoId,
        "userId": todo.userId
      }
    }).promise()

    return todo
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
