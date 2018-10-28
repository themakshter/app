import * as React from 'react';
import { Helmet } from 'react-helmet';
import {IMeetingMutation, newMeeting, newRemoteMeeting} from 'apollo/modules/meetings';
import {IURLConnector, setURL} from 'redux/modules/url';
import { AssessmentType, IAssessmentConfig, defaultRemoteMeetingLimit } from 'models/assessment';
import { bindActionCreators } from 'redux';
import { Grid, Message } from 'semantic-ui-react';
import {AssessmentConfig as AssessmentConfigComponent} from 'components/AssessmentConfig';
import {QuestionnaireRequired} from 'components/QuestionnaireRequired';
const { connect } = require('react-redux');
const config = require('../../../../config/main');
const ReactGA = require('react-ga');

const ConfigComponent = QuestionnaireRequired('To create a record', AssessmentConfigComponent);

interface IProp extends IMeetingMutation, IURLConnector {
  match: {
    params: {
      type: string,
    },
  };
  location: {
    search: string,
  };
}

interface IState {
  jti?: string;
}

function getBen(p: IProp): string|undefined {
  const urlParams = new URLSearchParams(p.location.search);
  return urlParams.has('ben') ? urlParams.get('ben') : undefined;
}

@connect(undefined, (dispatch) => ({
  setURL: bindActionCreators(setURL, dispatch),
}))
class AssessmentConfigInner extends React.Component<IProp, IState> {

  constructor(props) {
    super(props);
    this.state = {};
    this.shouldGetDate = this.shouldGetDate.bind(this);
    this.startMeeting = this.startMeeting.bind(this);
    this.renderInner = this.renderInner.bind(this);
    this.isUnknownType = this.isUnknownType.bind(this);
    this.getType = this.getType.bind(this);
    this.recordMeetingStarted = this.recordMeetingStarted.bind(this);
    this.getButtonText = this.getButtonText.bind(this);
  }

  private getType(): AssessmentType {
    return AssessmentType[this.props.match.params.type];
  }

  private recordMeetingStarted() {
    ReactGA.event({
      category: 'assessment',
      action: 'started',
      label: this.props.match.params.type,
    });
  }

  private startMeeting(config: IAssessmentConfig): Promise<void> {
    if (this.getType() === AssessmentType.remote) {
      return this.props.newRemoteMeeting(config, defaultRemoteMeetingLimit)
      .then((jti) => {
        this.recordMeetingStarted();
        this.setState({
          jti,
        });
      });
    } else {
      if (this.shouldGetDate() === false) {
        config.date = new Date();
      }
      return this.props.newMeeting(config)
      .then((meeting) => {
        this.recordMeetingStarted();
        if (this.getType() === AssessmentType.historic) {
          this.props.setURL(`/dataentry/${meeting.id}`);
        } else {
          this.props.setURL(`/meeting/${meeting.id}`);
        }
      });
    }
  }

  private shouldGetDate() {
    return this.getType() === AssessmentType.historic;
  }

  private isUnknownType(): boolean {
    return this.getType() === undefined;
  }

  private renderJTI(): JSX.Element {
    const jtiURL = `${config.app.root}/jti/${this.state.jti}`;
    return (
      <Message success={true}>
        <Message.Header>Success</Message.Header>
        <div>Please provide the following link to your beneficiary. <b>They have {defaultRemoteMeetingLimit} days to complete the questionnaire</b></div>
        <a href={jtiURL}>{jtiURL}</a>
      </Message>
    );
  }

  private getButtonText(): string {
    return this.getType() === AssessmentType.remote ? 'Generate Link' : 'Start';
  }

  private renderInner(): JSX.Element {
    if (this.isUnknownType()) {
      return (
        <Message error={true}>
          <Message.Header>Error</Message.Header>
          <div>Unknown assessment type</div>
        </Message>
      );
    }
    if (this.state.jti !== undefined) {
      return this.renderJTI();
    }
    return (
      <ConfigComponent
        defaultBen={getBen(this.props)}
        showDatePicker={this.shouldGetDate()}
        onSubmit={this.startMeeting}
        buttonText={this.getButtonText()}
      />
    );
  }

  public render() {
    return (
      <Grid container={true} columns={1} id="assessment-config">
        <Grid.Column>
          <Helmet title="New Record"/>
          <h1>New Record</h1>
          {this.renderInner()}
        </Grid.Column>
      </Grid>
    );
  }
}

const AssessmentConfig = newRemoteMeeting<IProp>(newMeeting<IProp>(AssessmentConfigInner));
export { AssessmentConfig };
