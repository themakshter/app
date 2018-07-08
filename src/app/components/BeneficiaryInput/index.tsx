import * as React from 'react';
import {isNullOrUndefined} from 'util';
import {Search, Input} from 'semantic-ui-react';
import {getBeneficiaries, IBeneficiaryResult} from 'apollo/modules/beneficiaries';
import './style.less';

interface IProps {
  onChange?: (ben: string) => void;
  onBlur?: (ben: string) => void;
  onFocus?: () => void;

  bens?: IBeneficiaryResult;
}

interface IState {
  benID?: string;
  searchResults?: any[];
}

class BeneficiaryInputInner extends React.Component<IProps, IState> {

  constructor(props) {
    super(props);
    this.state = {};
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.onSearchResultSelect = this.onSearchResultSelect.bind(this);
    // this.onInputChange = this.onInputChange.bind(this);
  }

  private onChange(benID) {
    this.setState({
      benID,
    });
    if (!isNullOrUndefined(this.props.onChange)) {
      this.props.onChange(benID);
    }
  }

  /*
  private onInputChange(_, data) {
    this.onChange(data.value);
  }
  */

  private onSearchResultSelect(_, data) {
    this.onChange(data.result.title);
    this.props.onBlur(data.result.title);
  }

  private onBlur() {
    if (!isNullOrUndefined(this.props.onBlur)) {
      this.props.onBlur(this.state.benID);
    }
  }

  private handleSearchChange(_, { value }) {
    this.onChange(value);
    const newBeneficiaryResult = {
      title: value,
      description: `Create ${value}'s first record`,
    };

    if (isNullOrUndefined(this.props.bens.getBeneficiaries) || value.length < 1) {
      return this.setState({
        searchResults: [newBeneficiaryResult],
      });
    }

    const re = new RegExp(value, 'i');
    const isMatch = (x) => re.test(x);
    const matchingBens = this.props.bens.getBeneficiaries.filter(isMatch);

    const searchResults = matchingBens.map((b) => ({
      title: b,
    }));

    const exactMatch = this.props.bens.getBeneficiaries.find((b) => b === value);
    if (exactMatch === undefined) {
      searchResults.push(newBeneficiaryResult);
    }

    this.setState({
      searchResults,
    });
  }

  public render() {
    return (
      <div className="beneficiary-input">
        <Search
          loading={this.props.bens.loading}
          onResultSelect={this.onSearchResultSelect}
          onSearchChange={this.handleSearchChange}
          results={this.state.searchResults}
          onBlur={this.onBlur}
          onFocus={this.props.onFocus}
          icon={undefined}
          fluid={true}
          showNoResults={false}
          input={<Input type="text" placeholder="Beneficiary ID" />}
        />
      </div>
      // <Input type="text" placeholder="Beneficiary ID" onChange={this.onInputChange} onBlur={this.onBlur} onFocus={this.props.onFocus} />
    );
  }
}

const BeneficiaryInput = getBeneficiaries<IProps>(BeneficiaryInputInner, 'bens');
export {BeneficiaryInput};
