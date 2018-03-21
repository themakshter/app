import * as React from 'react';
import { Helmet } from 'react-helmet';
import {Button, Loader, Grid, ButtonProps} from 'semantic-ui-react';
import {IURLConnector} from 'redux/modules/url';
import {getMeeting, IMeetingResult} from 'apollo/modules/meetings';
import {RecordTagInput} from 'components/RecordTagInput';
import {DateTimePicker} from 'components/DateTimePicker';
import {Hint} from 'components/Hint';
import * as moment from 'moment';
import {bindActionCreators} from 'redux';
import {setURL} from 'redux/modules/url';
const strings = require('./../../../strings.json');
const { connect } = require('react-redux');

interface IProps extends IURLConnector {
  params: {
    id: string,
  };
  location: {
    // can provide a ?next=relativeURL which the user will be taken to on cancel or successful save
    search: string,
  };
  data: IMeetingResult;
}

interface IState {
  saveError?: string;
  conducted?: moment.Moment;
  tags?: string[];
  saving?: boolean;
}

function getNextPageURL(p: IProps): string|undefined {
  const urlParams = new URLSearchParams(p.location.search);
  if (urlParams.has('next') === false) {
    return undefined;
  }
  return urlParams.get('next');
}

@connect(undefined, (dispatch) => ({
  setURL: bindActionCreators(setURL, dispatch),
}))
class RecordEditInner extends React.Component<IProps, IState> {

  constructor(props) {
    super(props);
    this.saveRecord = this.saveRecord.bind(this);
    this.setTags = this.setTags.bind(this);
    this.setConductedDate = this.setConductedDate.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.loadState = this.loadState.bind(this);
  }

  public componentWillMount() {
    if (this.props.data.getMeeting !== undefined) {
      console.log('mount');
      this.loadState(this.props);
    }
  }

  public componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.data.getMeeting !== undefined && this.props.data.getMeeting === undefined) {
      console.log('receive');
      this.loadState(nextProps);
    }
  }

  private loadState(p: IProps) {
    this.setState({
      conducted: moment(p.data.getMeeting.conducted),
      tags: p.data.getMeeting.tags,
    });
  }

  private saveRecord() {
    // const {conducted, tags} = this.state;
    this.setState({
      saving: true,
      saveError: undefined,
    });
    return Promise.resolve()
      .then(() => {
        this.nextPage();
      })
      .catch((e) => {
        this.setState({
          saving: false,
          saveError: e,
        });
      });
  }

  private nextPage() {
    const nextPage = getNextPageURL(this.props);
    if (nextPage !== undefined) {
      this.props.setURL(nextPage);
      return;
    }
    const record = this.props.data.getMeeting;
    if (record !== undefined) {
      this.props.setURL(`/beneficiary/${record.beneficiary}`);
      return;
    }
    this.props.setURL('/');
  }

  private setConductedDate(date: moment.Moment) {
    this.setState({
      conducted: date,
    });
  }

  private setTags(tags: string[]): void {
    this.setState({
      tags,
    });
  }

  public render() {
    const wrapper = (inner: JSX.Element): JSX.Element => {
      return (
        <Grid container columns={1} id="meeting">
          <Grid.Column>
            <Helmet>
              <title>Edit Record</title>
            </Helmet>
            <div id="record-edit">
              {inner}
            </div>
          </Grid.Column>
        </Grid>
      );
    };

    if(this.props.params.id === undefined) {
      return wrapper(<div />);
    }

    const record = this.props.data.getMeeting;
    if(record === undefined) {
      return wrapper(<Loader active={true} inline="centered" />);
    }

    const startProps: ButtonProps = {};
    if (this.state.saving) {
      startProps.loading = true;
      startProps.disabled = true;
    }

    return wrapper((
      <div className="impactform">
        <div>
          <h3 className="label">Beneficiary ID</h3>
          <span>{record.beneficiary}</span>
        </div>
        <div>
          <h3 className="label">Questionnaire</h3>
          <span>{record.outcomeSet.name}</span>
        </div>
        <div>
          <h3 className="label optional"><Hint text={strings.tagExplanation} />Tags</h3>
          <RecordTagInput onChange={this.setTags} tags={this.state.tags} />
        </div>
        <div>
          <h3 className="label">Date Conducted</h3>
          <span className="conductedDate">{this.state.conducted.format('llll')}</span>
          <DateTimePicker moment={this.state.conducted} onChange={this.setConductedDate} allowFutureDates={false} />
        </div>
        <div>
          <Button className="cancel" onClick={this.nextPage}>Cancel</Button>
          <Button {...startProps} className="submit" onClick={this.saveRecord}>Save</Button>
          <p>{this.state.saveError}</p>
        </div>
      </div>
    ));
  }
}

const RecordEdit = getMeeting<IProps>((props) => props.params.id)(RecordEditInner);
export { RecordEdit }
