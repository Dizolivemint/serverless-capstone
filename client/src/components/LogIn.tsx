import * as React from 'react'
import Auth from '../auth/Auth'
import { Button, Header } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div>
        <Header as="h1">New Year Goals</Header>
        <h5 style={
          {margin: "-1rem 124px 1rem"}
        }>by&nbsp;Milesoft</h5>
        <Button onClick={this.onLogin} size="huge" color="olive">
          Log in
        </Button>
        <ul>
          <li>Track your goals</li>
          <li>Add images to your goals</li>
          <li>Share and view public goals</li>
          <li>Free and private*</li>
        </ul>
        <p>*Your information will not be sold or used for advertising</p>
      </div>
    )
  }
}
