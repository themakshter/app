import * as React from 'react';
import {getMeetings, IMeetingResult} from 'apollo/modules/meetings';
import {getOutcomeGraph} from '@ald-life/outcome-graph';
import {Answer} from 'models/answer';
import './style.less';

let count = 0;

interface IProp {
  beneficiaryID: string;
  data?: IMeetingResult;
}

class MeetingViewInner extends React.Component<IProp, any> {

  private canvasID: string;

  constructor(props) {
    super(props);
    this.canvasID = `meeting-view-${count++}`;
  }

  public componentDidUpdate() {
    if (this.props.data.getMeetings === undefined) {
      return;
    }
    const meeting = this.props.data.getMeetings.map((meeting) => {
      const answers = meeting.answers.map((answer: Answer) => {
        const q = meeting.outcomeSet.questions.find((q) => q.id === answer.questionID);
        let question = 'Unknown Question';
        if (q !== undefined) {
          question = q.question;
        }
        return {
          outcome: question,
          value: answer.answer,
        };
      });
      return {
        timestamp: meeting.conducted,
        outcomes: answers,
      };
    });
    getOutcomeGraph(this.canvasID, '', meeting);
  }

  public render() {
    return (
      <div className="meeting-view">
        <h2>{this.props.beneficiaryID}</h2>
        <div id="wrapper" style={{position: 'relative',height: '50vh', width:'50vw', margin:'auto'}}>
          <canvas id={this.canvasID} width={500} height={500} />
        </div>
      </div>
    );
  }
}

const MeetingView = getMeetings<IProp>((p) => p.beneficiaryID)(MeetingViewInner);
export { MeetingView }