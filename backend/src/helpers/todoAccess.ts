import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { PubItem } from '../models/PubItem'
import { TodoDelete } from '../models/TodoDelete'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('DB Access')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.CREATED_AT_INDEX,
    private readonly pubIndex = process.env.TODOS_PUBLIC_INDEX,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) {
  }

  async getTodosForUser(userId): Promise<TodoItem[]> {
    logger.info(`Getting all todos for user id ${userId}`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getPublicTodos(): Promise<PubItem[]> {
    logger.info(`Getting all public todos`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.pubIndex,
      KeyConditionExpression: 'isPublic = :isPublic',
      ExpressionAttributeValues: {
        ':isPublic': 'x'
      }
    }).promise()

    const items = result.Items
    return items as PubItem[]
  }

  async getTodo(userId, todoId): Promise<TodoItem> {
    logger.info(`Getting todo id ${todoId} for user id ${userId}`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    }).promise()

    const item = result.Items[0]
    return item as TodoItem
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodoItem(todo: TodoItem): Promise<UpdateTodoRequest> {
    logger.info('Updating todo id ', todo.todoId)

    const result = await this.docClient.update({
      TableName: this.todosTable,
      Key:{
        "todoId": todo.todoId,
        "userId": todo.userId
      },
      ExpressionAttributeNames: {
        '#todo_name': 'name'
      },
      UpdateExpression: "set #todo_name = :n, dueDate=:d, done=:c, isPublic=:p",
      ExpressionAttributeValues:{
        ":n": todo.name,
        ":d": todo.dueDate,
        ":c": todo.done,
        ":p": todo.isPublic
      },
      ReturnValues:"UPDATED_NEW"
    }).promise()

    const { name, dueDate, done, isPublic } = result.Attributes

    const todoUpdated = {
      name,
      dueDate,
      done,
      isPublic
    }
    return todoUpdated
  }
  
  async deleteTodoItem(todoId: string, userId: string): Promise<TodoDelete> {
    const todo = {
      todoId,
      userId
    }

    await this.docClient.delete({
      TableName: this.todosTable,
      Key:{
        "todoId": todo.todoId,
        "userId": todo.userId
      }
    }).promise()

    return todo
  }

  async addAttachmentUrl(todoId: string, userId: string) {
    
    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  
    logger.info('Storing new item for ', todoId)
  
    await this.docClient.update({
      TableName: this.todosTable,
      Key:{
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: "set attachmentUrl = :a",
      ExpressionAttributeValues:{
        ":a": attachmentUrl
      },
      ReturnValues:"UPDATED_NEW"
    }).promise()
  
    return
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
