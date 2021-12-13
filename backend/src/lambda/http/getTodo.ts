import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodo } from '../../helpers/todos'
import { getUserId } from '../utils';

// Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {   
    const todoId = event.pathParameters.todoId
    
    const item = await getTodo(getUserId(event), todoId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Crentials': true
      },
      body: JSON.stringify({
        item
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
