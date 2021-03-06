import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { calculateDueDate, stringifyDueDate } from '../helpers/DueDate'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean,
  dueDate: Date,
  showDueDate: boolean,
  showNewButton: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    dueDate: calculateDueDate(),
    showDueDate: false,
    showNewButton: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') this.onTodoCreate()
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async () => {
    this.setState({ loadingTodos: true })
    try {
      const dueDate = stringifyDueDate(this.state.dueDate)
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: '',
        showDueDate: false,
        showNewButton: true,
        loadingTodos: false
      })
    } catch {
      alert('Goal creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Goal deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done,
        isPublic: todo.isPublic ? 'x' : ''
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Goal update failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
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
        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid>
        <Grid.Row>
          { this.state.showDueDate ? 
          <Grid.Column width={16}>
            <div className="wrapper border-radius--4">
              <Icon 
                name='calendar alternate outline'
                size='big'
              />
              <div className="wrapper predatepicker">
                <h5>Due&nbsp;date</h5>
              </div>
              <DatePicker className="datepicker"
                selected={this.state.dueDate}
                onChange={(date: Date) => this.setState({ dueDate: date})}
              />
            </div>
          </Grid.Column>:  null }
          {this.state.showNewButton ?
          <Grid.Column width={16}>
            <Button
              primary
              icon
              labelPosition='left'
              onClick={() => { this.setState({ 
                showNewButton: false,
                showDueDate: true
              }) 
            }}
            >
              <Icon name='add' />
              New Goal
            </Button>
          </Grid.Column> : 
          <Grid.Column width={16}>
            <Input
              action={{
                color: 'teal',
                labelPosition: 'left',
                icon: 'add',
                content: 'New Goal',
                onClick: this.onTodoCreate
              }}
              fluid
              actionPosition="left"
              placeholder="To change the world..."
              onKeyDown={this.handleKeyDown}
              onChange={this.handleNameChange}
            />
          </Grid.Column>
          }
        </Grid.Row>
        <Divider />
      </Grid>
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
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={3}>
                <Button
                  floated="right"
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={3}>
                <Button
                  floated="right"
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image className="mt-1" src={todo.attachmentUrl} size="small" wrapped />
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
