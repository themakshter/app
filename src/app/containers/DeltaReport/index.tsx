import * as React from 'react';
import {getDeltaReport, IDeltaReportResult} from 'apollo/modules/reports';
import {getOutcomeSet, IOutcomeResult} from 'apollo/modules/outcomeSets';
import {IStore} from 'redux/IStore';
import {Aggregation, getAggregation, getVisualisation, Visualisation} from 'models/pref';
import './style.less';
import {bindActionCreators} from 'redux';
import {IURLConnector, setURL} from 'redux/modules/url';
import {
  exportReportData,
  getEndDateFromProps,
  getOpenStartFromProps,
  getOrFromProps,
  getQuestionSetIDFromProps,
  getStartDateFromProps,
  getTagsFromProps,
  IReportProps,
  renderEmptyReport,
} from 'containers/Report/helpers';
import {ApolloLoaderHoC} from 'components/ApolloLoaderHoC';
import {PageWrapperHoC} from 'components/PageWrapperHoC';
import {VizControlPanel} from 'components/VizControlPanel';
import {DeltaReportStackedBarGraph} from './bar';
import {DeltaReportDetails} from './details';
import {DeltaTable} from './table';

const { connect } = require('react-redux');

interface IProp extends IDeltaReportResult, IURLConnector, IReportProps {
  data: IOutcomeResult;
  vis?: Visualisation;
  agg?: Aggregation;
  isCategoryAgPossible?: boolean;
  isCanvasSnapshotPossible?: boolean;
}

const isCategoryAggregationAvailable = (props: IProp): boolean => {
  if (props.DeltaReport.error || props.DeltaReport.loading) {
    return false;
  }
  return props.DeltaReport.getDeltaReport.categories.length > 0;
};

@connect((state: IStore, ownProps: IProp) => {
  const canCatAg = isCategoryAggregationAvailable(ownProps);
  const viz = getVisualisation(state.pref, false);
  return {
    vis: viz,
    agg: getAggregation(state.pref, canCatAg),
    isCategoryAgPossible: canCatAg,
    isCanvasSnapshotPossible: viz === Visualisation.RADAR,
  };
}, (dispatch) => ({
  setURL: bindActionCreators(setURL, dispatch),
}))
class DeltaReportInner extends React.Component<IProp, any> {

  constructor(props) {
    super(props);
    this.renderVis = this.renderVis.bind(this);
    this.export = this.export.bind(this);
  }

  private renderVis(): JSX.Element {
    const p = this.props;
    if (p.vis === Visualisation.RADAR) {
      return <DeltaReportStackedBarGraph report={p.DeltaReport.getDeltaReport} questionSet={p.data.getOutcomeSet} category={p.agg === Aggregation.CATEGORY} />;
    } else {
      return <DeltaTable report={p.DeltaReport.getDeltaReport} />;
    }
  }

  private export() {
    exportReportData(this.props, this.props);
  }

  public render() {
    if (this.props.DeltaReport.getDeltaReport && this.props.DeltaReport.getDeltaReport.beneficiaries.length === 0) {
      return renderEmptyReport(this.props.DeltaReport.getDeltaReport.excluded);
    }
    return (
      <div>
        <DeltaReportDetails report={this.props.DeltaReport.getDeltaReport} questionnaire={this.props.data.getOutcomeSet} />
        <VizControlPanel canCategoryAg={this.props.isCategoryAgPossible} allowGraph={false} export={this.export} allowCanvasSnapshot={this.props.isCanvasSnapshotPossible} />
        {this.renderVis()}
      </div>
    );
  }
}

const DeltaInnerWithSpinner = ApolloLoaderHoC<IProp>('report', (p: IProp) => p.DeltaReport, DeltaReportInner);
const DeltaInnerWithSpinners = ApolloLoaderHoC('questionnaire', (p: IProp) => p.data, DeltaInnerWithSpinner);

const DeltaInnerWithReport = getDeltaReport<IProp>(getQuestionSetIDFromProps, getStartDateFromProps, getEndDateFromProps, getTagsFromProps, getOpenStartFromProps, getOrFromProps)(DeltaInnerWithSpinners);
const DeltaInnerWithQuestionnaire = getOutcomeSet<IProp>(getQuestionSetIDFromProps)(DeltaInnerWithReport);

const DeltaReport = PageWrapperHoC('Delta Report', 'delta-report', DeltaInnerWithQuestionnaire);
export {DeltaReport};
