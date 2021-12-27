import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Divider,
  Grid,
  Header,
  Image,
  Loader
} from 'semantic-ui-react'

import { getPubs } from '../api/todos-api'
import Auth from '../auth/Auth'
import { PubItem } from '../types/PubItem'
import "react-datepicker/dist/react-datepicker.css"

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: PubItem[]
  loadingTodos: boolean
}

export class Pub extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    loadingTodos: true
  }

  async componentDidMount() {
    try {
      const todos = await getPubs(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      let errorMessage = "Failed to fetch todos"
      if (e instanceof Error) {
        errorMessage = `${errorMessage}: ${e.message}`
      }
      alert(errorMessage)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">New Year Goals</Header>
        <h5 style={
          {margin: "-1rem 124px 1rem"}
        }>by&nbsp;Milesoft</h5>
        {this.renderTodos()}
      </div>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Goals
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="medium" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
