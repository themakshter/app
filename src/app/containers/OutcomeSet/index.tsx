import * as React from 'react';
import { Helmet } from 'react-helmet';
import {IOutcomeResult, getOutcomeSet, IOutcomeMutation, editQuestionSet} from 'apollo/modules/outcomeSets';
import {IQuestionMutation, deleteQuestion} from 'apollo/modules/questions';
import { Button, Input, Icon, Grid, Loader } from 'semantic-ui-react';
import {CategoryList} from 'components/CategoryList';
import {QuestionList} from 'components/QuestionList';
import {Hint} from 'components/Hint';
const strings = require('./../../../strings.json');
import './style.less';

interface IProps extends IOutcomeMutation, IQuestionMutation {
  data: IOutcomeResult;
  params: {
      id: string,
  };
};

interface IState {
  editNameError?: string;
  editDescriptionError?: string;
  newName?: string;
  newDescription?: string;
  displayEditNameControl?: boolean;
  displayEditDescriptionControl?: boolean;
};

class OutcomeSetInner extends React.Component<IProps, IState> {
  private editDescriptionInput: HTMLInputElement;
  private editNameInput: HTMLInputElement;

  constructor(props) {
    super(props);
    this.state = {};
    this.handleEditNameInputRef = this.handleEditNameInputRef.bind(this);
    this.handleEditDescriptionInputRef = this.handleEditDescriptionInputRef.bind(this);
    this.editQS = this.editQS.bind(this);
    this.editName = this.editName.bind(this);
    this.editDescription = this.editDescription.bind(this);
    this.setNewName = this.setNewName.bind(this);
    this.setNewDescription = this.setNewDescription.bind(this);
    this.displayEditNameControl = this.displayEditNameControl.bind(this);
    this.displayEditDescriptionControl = this.displayEditDescriptionControl.bind(this);
    this.renderEditNameButton = this.renderEditNameButton.bind(this);
    this.renderEditDescriptionButton = this.renderEditDescriptionButton.bind(this);
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { displayEditNameControl, displayEditDescriptionControl } = this.state;

    // if the editNameControl was newly displayed during this update
    if (displayEditNameControl && (!displayEditDescriptionControl || prevState.displayEditDescriptionControl)) {
      this.editNameInput.focus();
    }

    // if the editDescriptionControl was newly displayed during this update
    if (displayEditDescriptionControl && (!displayEditNameControl || prevState.displayEditNameControl)) {
      this.editDescriptionInput.focus();
    }
  }

  private editQS(editedValueType: 'name' | 'description') {
    let editedControlDisplayState, editedControlErrorState;

    if (editedValueType === 'name') {
      editedControlDisplayState = 'displayEditNameControl';
      editedControlErrorState = 'editNameError';
    } else if (editedValueType === 'description') {
      editedControlDisplayState = 'displayEditDescriptionControl';
      editedControlErrorState = 'editDescriptionError';
    }

    this.props.editQuestionSet(
      this.props.params.id,
      this.state.newName || this.props.data.getOutcomeSet.name,
      this.state.newDescription || this.props.data.getOutcomeSet.description,
    )
    .then(() => {
      this.setState({
        [editedControlDisplayState]: false,
        [editedControlErrorState]: undefined,
      });
    })
    .catch((e: Error)=> {
      this.setState({
        [editedControlErrorState]: e.message,
      });
    });
  }

  private editName() {
    this.editQS('name');
  }

  private editDescription() {
    this.editQS('description');
  }

  private moveCaretAtEnd(e) {
    const tempValue = e.target.value;
    e.target.value = '';
    e.target.value = tempValue;
  }

  private handleEditNameInputRef(input) {
    this.editNameInput = input;
  }

  private handleEditDescriptionInputRef(input) {
    this.editDescriptionInput = input;
  }

  private setNewName(_, data) {
    this.setState({
      newName: data.value,
    });
  }

  private setNewDescription(_, data) {
    this.setState({
      newDescription: data.value,
    });
  }

  private displayEditNameControl() {
    this.setState({
      displayEditNameControl: true,
    });
  }

  private displayEditDescriptionControl() {
    this.setState({
      displayEditDescriptionControl: true,
    });
  }

  private renderEditNameControl(): JSX.Element {
    return (
      <div className="edit-control">
        <Input
          type="text"
          placeholder="Name"
          size="huge"
          onChange={this.setNewName}
          defaultValue={this.props.data.getOutcomeSet.name}
          ref={this.handleEditNameInputRef}
          onFocus={this.moveCaretAtEnd}
        />
        <Button onClick={this.editName} size="huge" icon labelPosition="right">
          Edit name
          <Icon name="pencil"/>
        </Button>
        <p>{this.state.editNameError}</p>
      </div>
    );
  }

  private renderEditNameButton(): JSX.Element {
    return (
      <Button icon basic circular size="mini" onClick={this.displayEditNameControl}>
        <Icon name="pencil"/>
      </Button>
    );
  }

  private renderEditDescriptionControl(): JSX.Element {
    return (
      <div className="edit-control">
        <Input
          type="text"
          placeholder="Description"
          onChange={this.setNewDescription}
          defaultValue={this.props.data.getOutcomeSet.description}
          ref={this.handleEditDescriptionInputRef}
          onFocus={this.moveCaretAtEnd}
        />
        <Button onClick={this.editDescription} icon labelPosition="right">
          Edit description
          <Icon name="pencil"/>
        </Button>
        <p>{this.state.editDescriptionError}</p>
      </div>
    );
  }

  private renderEditDescriptionButton(): JSX.Element {
    return (
      <Button icon basic circular size="mini" onClick={this.displayEditDescriptionControl}>
        <Icon name="pencil"/>
      </Button>
    );
  }

  public render() {
    const { data } = this.props;
    const { displayEditNameControl, displayEditDescriptionControl } = this.state;
    if (data.loading) {
      return (
        <Loader active={true} inline="centered" />
      );
    }
    const os = data.getOutcomeSet;
    if (os === undefined) {
        return (<div />);
    }
    return (
      <Grid container columns={1} id="question-set">
        <Grid.Column>
          <Helmet>
            <title>Question Sets</title>
          </Helmet>
          {displayEditNameControl ?
            this.renderEditNameControl()
            :
            <h1>{os.name}{this.renderEditNameButton()}</h1>
          }
          {displayEditDescriptionControl ?
            this.renderEditDescriptionControl()
            :
            <div>Description: {os.description || 'No description'}{this.renderEditDescriptionButton()}</div>
          }
          <h3>Questions</h3>
          <QuestionList outcomeSetID={this.props.params.id} />
          <h3>Question Categories <Hint text={strings.questionCategoryExplanation} /></h3>
          <CategoryList outcomeSetID={this.props.params.id} />
        </Grid.Column>
      </Grid>
    );
  }
}
const OutcomeSet = getOutcomeSet<IProps>((props) => props.params.id)(editQuestionSet<IProps>(deleteQuestion(OutcomeSetInner)));
export { OutcomeSet }
