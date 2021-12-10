import * as React from 'react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import {
  Grid,
  Input,
  Icon,
  Form,
  Button
} from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState,
  title: string,
  dueDate: Date
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    title: '',
    dueDate: new Date()
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      let errorMessage = "Could not upload a file"
      if (e instanceof Error) {
        errorMessage = `${errorMessage}: ${e.message}`
      }
      alert(errorMessage)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <Grid>
        <Grid.Row>
          <h1>Edit task</h1>
          <Grid.Column width={16}>
            <div className="wrapper border-color--grey border-radius--4">
              <Icon 
                name='calendar alternate outline'
                size='big'
              />
              <DatePicker className="datepicker"
                selected={this.state.dueDate}
                onChange={(date: Date) => this.setState({ dueDate: date})}
              />
            </div>
          </Grid.Column>
          <Grid.Column width={16}>
            <Input
              icon='pencil'
              iconPosition='left'
              fluid
              placeholder="To change the world..."
              className="mt-1"
              // onKeyDown={}
              // onChange={}
            />
          </Grid.Column>
          <Grid.Column width={16}>
            <Button
              iconn='pencil'
              iconPosition='left'
              color='teal'
              className='mt-1'
              // onKeyDown={}
              // onChange={}
            >
              Save
            </Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <h1>Upload new image</h1>
          <Grid.Column width={16}>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <label>File</label>
                <input
                  type="file"
                  accept="image/*"
                  placeholder="Image to upload"
                  onChange={this.handleFileChange}
                />
              </Form.Field>

              {this.renderButton()}
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
