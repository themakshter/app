import * as React from 'react';
import {IAnswerAggregationReport, IAnswerAggregation} from 'models/report';
import {IOutcomeSet} from 'models/outcomeSet';
import {RadarChart} from 'components/RadarChart';
import {RadarData, IRadarSeries, IRadarPoint} from 'models/radar';
import {Aggregation} from 'models/pref';
import {
  getMinQuestionValue, getMaxQuestionValue, getMinCategoryValue, getMaxCategoryValue,
  getQuestionFriendlyName, getCategoryFriendlyName,
} from 'helpers/questionnaire';

interface IProp {
  serviceReport: IAnswerAggregationReport;
  questionSet: IOutcomeSet;
  category?: boolean;
}

function getRadarSeries(aa: IAnswerAggregation[], labeller: (IAnswerAggregation) => string, indexer: (IAnswerAggregation) => number): IRadarSeries[] {
  const pre = aa.reduce((pre, a) => {
    const label = labeller(a);
    const idx = indexer(a);
    pre.initial.push({
      axis: label,
      axisIndex: idx,
      value: a.initial,
    });
    pre.latest.push({
      axis: label,
      axisIndex: idx,
      value: a.latest,
    });
    return pre;
  }, {
    initial: [] as IRadarPoint[],
    latest: [] as IRadarPoint[],
  });
  return [{
    name: 'Initial',
    datapoints: pre.initial,
  }, {
    name: 'Latest',
    datapoints: pre.latest,
  }];
}

class ServiceReportRadar extends React.Component<IProp, any> {

  private getCategoryRadarData(p: IProp): RadarData {
    const getCatLabel = (aa: IAnswerAggregation): string => {
      return getCategoryFriendlyName(aa.id, p.questionSet);
    };
    const getCatIdx = (aa: IAnswerAggregation): number => {
      return p.questionSet.categories.findIndex((c) => c.id === aa.id);
    };
    return {
      series: getRadarSeries(p.serviceReport.categories, getCatLabel, getCatIdx),
      scaleMin: getMinCategoryValue(p.questionSet),
      scaleMax: getMaxCategoryValue(p.questionSet),
    };
  }

  private getQuestionRadarData(p: IProp): RadarData {
    const getQLabel = (aa: IAnswerAggregation): string => {
      return getQuestionFriendlyName(aa.id, p.questionSet);
    };
    const getQIdx = (aa: IAnswerAggregation): number => {
      return p.questionSet.questions.findIndex((q) => q.id === aa.id);
    };
    return {
      series: getRadarSeries(p.serviceReport.questions, getQLabel, getQIdx),
      scaleMin: getMinQuestionValue(p.questionSet),
      scaleMax: getMaxQuestionValue(p.questionSet),
    };
  }

  private getRadarData(p: IProp): RadarData {
    if (p.category) {
      return this.getCategoryRadarData(p);
    }
    return this.getQuestionRadarData(p);
  }

  private renderRadar(p: IProp): JSX.Element {
    if (p.serviceReport.beneficiaries.length === 0) {
      return (<div />);
    }
    const data = this.getRadarData(p);
    const agg = this.props.category ? Aggregation.CATEGORY : Aggregation.QUESTION;
    return (
      <RadarChart data={data} aggregation={agg}/>
    );
  }

  public render() {
    return (
      <div className="service-report-radar">
        {this.renderRadar(this.props)}
      </div>
    );
  }
}

export {ServiceReportRadar};
