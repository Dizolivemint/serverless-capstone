import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getPublicTodos } from '../../helpers/todos'
import { getUserId } from '../utils';

// Get public items
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {   
    const items = await getPublicTodos(getUserId(event))
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Crentials': true
      },
      body: JSON.stringify({
        items
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
