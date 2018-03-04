import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';
import {QuestionSetSelect} from 'components/QuestionSetSelect';
import {VizControlPanel} from 'components/VizControlPanel';
import {setURL} from 'modules/url';
import { bindActionCreators } from 'redux';
import {IStore} from 'redux/IStore';
import {IURLConnector} from 'redux/modules/url';
import {Aggregation, Visualisation, getAggregation, getVisualisation, getSelectedQuestionSetID} from 'models/pref';
import {getMeetings, IMeetingResult} from 'apollo/modules/meetings';
import {IMeeting} from 'models/meeting';
import {MeetingRadar} from 'components/MeetingRadar';
import {MeetingTable} from 'components/MeetingTable';
import {isBeneficiaryUser} from 'modules/user';
import {MeetingGraph} from '../../components/MeetingGraph';
const { connect } = require('react-redux');

interface IProps extends IURLConnector {
  params: {
    id: string,
  };
  vis?: Visualisation;
  agg?: Aggregation;
  selectedQuestionSetID?: string;
  data?: IMeetingResult;
  isCategoryAgPossible?: boolean;
}

function isCategoryAggregationAvailable(meetings: IMeeting[], selectedQuestionSetID: string|undefined): boolean {
  if (!Array.isArray(meetings) || meetings.length === 0) {
    return false;
  }
  const meetingsBelongingToSelectedQS = meetings.filter((m) => {
    return selectedQuestionSetID !== undefined && m.outcomeSetID === selectedQuestionSetID;
  });
  const meetingsWithCategories = meetingsBelongingToSelectedQS.filter((m) => {
    return m.outcomeSet.categories.length > 0;
  });
  return meetingsWithCategories.length > 0;
}

function getQuestionSetOptions(ms: IMeeting[]): string[] {
  if (!Array.isArray(ms)) {
    return [];
  }
  return ms.map((m) => m.outcomeSetID);
}

function filterMeetings(m: IMeeting[], questionSetID: string): IMeeting[] {
  return m.filter((m) => m.outcomeSetID === questionSetID);
}

@connect((state: IStore, ownProps: IProps) => {
  const selectedQuestionSetID = getSelectedQuestionSetID(state.pref);
  const canCatAg = isCategoryAggregationAvailable(ownProps.data.getMeetings, selectedQuestionSetID);
  return {
    vis: getVisualisation(state.pref, true),
    agg: getAggregation(state.pref, canCatAg),
    isCategoryAgPossible: canCatAg,
    selectedQuestionSetID,
    isBeneficiary: isBeneficiaryUser(state.user),
  };
}, (dispatch) => ({
  setURL: bindActionCreators(setURL, dispatch),
}))
class JourneyInner extends React.Component<IProps, any> {

  constructor(props) {
    super(props);
    this.renderVis = this.renderVis.bind(this);
    this.renderJourney = this.renderJourney.bind(this);
  }

  private renderVis(): JSX.Element {
    const { data: { getMeetings }, vis, selectedQuestionSetID, agg } = this.props;
    const meetings = filterMeetings(getMeetings, selectedQuestionSetID);

    if (vis === Visualisation.RADAR) {
      return (
        <MeetingRadar aggregation={agg} meetings={meetings} />
      );
    }
    if (vis === Visualisation.GRAPH) {
      return (
        <MeetingGraph meetings={meetings} aggregation={agg}/>
      );
    }
    return (
      <MeetingTable aggregation={agg} meetings={meetings} />
    );
  }

  private renderJourney(): JSX.Element {
    if (this.props.data.loading) {
      return (
        <Loader active={true} inline="centered" />
      );
    }
    if (this.props.data.error !== undefined) {
      return (
        <Message error={true}>
          <Message.Header>Error</Message.Header>
          <div>Failed to load records</div>
        </Message>
      );
    }
    if (!Array.isArray(this.props.data.getMeetings) || this.props.data.getMeetings.length === 0) {
      return (
        <p>No complete meetings found for beneficiary {this.props.params.id}</p>
      );
    }
    return (
      <div>
        <VizControlPanel canCategoryAg={this.props.isCategoryAgPossible} allowGraph={true}/>
        <QuestionSetSelect
          allowedQuestionSetIDs={getQuestionSetOptions(this.props.data.getMeetings)}
          autoSelectFirst={true}
        />
        {this.renderVis()}
      </div>
    );
  }

  public render() {
    if(this.props.params.id === undefined) {
      return (<div />);
    }

    return (
      <div id="journey">
        {this.renderJourney()}
      </div>
    );
  }
}

const Journey = getMeetings<IProps>((p) => p.params.id)(JourneyInner);
export { Journey }