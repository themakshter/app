import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Icon, Grid, Form } from 'semantic-ui-react';
import {BeneficiaryInput} from 'components/BeneficiaryInput';
import {FormField} from 'components/FormField';
import { bindActionCreators } from 'redux';
import { IURLConnector, setURL } from 'redux/modules/url';
import { Hint } from 'components/Hint';
import './style.less';
import {FormikBag, FormikErrors, FormikValues, InjectedFormikProps, withFormik} from 'formik';
const formFailureGeneric = require('../../../strings.json').formFailureGeneric;
const { connect } = require('react-redux');
const strings = require('./../../../strings.json');

interface IFormOuput {
  beneficiaryID: string;
}

interface IFormProps {
  onBeneficiarySelect(benID: string): void;
}

const InnerForm = (props: InjectedFormikProps<any, IFormOuput>) => {
  const { touched, error, errors, isSubmitting, setFieldValue, submitForm, setFieldTouched, isValid } = props;
  const onChange = (benID: string) => setFieldValue('beneficiaryID', benID);
  const onBlur = () => setFieldTouched('beneficiaryID');
  const label = <span><Hint text={strings.beneficiaryIDExplanation} />Beneficiary</span>;
  return (
    <Form className="screen" onSubmit={submitForm}>
      <FormField error={errors.beneficiaryID as string} touched={touched.beneficiaryID} inputID="rsf-ben" required={true} label={label}>
        <BeneficiaryInput inputID="rsf-ben" onChange={onChange} onBlur={onBlur}/>
      </FormField>
      <Form.Group>
        <Form.Button type="submit" primary={true} disabled={!isValid || isSubmitting} loading={isSubmitting}>Review</Form.Button>
      </Form.Group>
      {error && <span className="submit-error"><Icon name="exclamation" />Editing the questionnaire failed. {formFailureGeneric}</span>}
    </Form>
  );
};

const BeneficairyForm = withFormik<IFormProps, IFormOuput>({
  validate: (values: IFormOuput) => {
    const errors: FormikErrors<IFormOuput> = {};
    if (!values.beneficiaryID) {
      errors.beneficiaryID = 'Please select a beneficiary';
    }
    return errors;
  },
  handleSubmit: (v: FormikValues, formikBag: FormikBag<IFormProps, IFormOuput>): void => {
    formikBag.setSubmitting(true);
    formikBag.props.onBeneficiarySelect(v.beneficiaryID);
  },
})(InnerForm);

@connect(undefined, (dispatch) => ({
  setURL: bindActionCreators(setURL, dispatch),
}))
class ReviewSelector extends React.Component<IURLConnector, any> {

  constructor(props) {
    super(props);
    this.review = this.review.bind(this);
  }

  private review(benID: string) {
    this.props.setURL(`/beneficiary/${benID}`);
  }

  public render() {
    return (
      <Grid container={true} columns={1} >
        <Grid.Column>
          <div id="reviewselector">
            <Helmet>
              <title>Review</title>
            </Helmet>
            <h1>Review</h1>
            <BeneficairyForm onBeneficiarySelect={this.review} />
          </div>
          {this.props.children}
        </Grid.Column>
      </Grid>
    );
  }
}

export { ReviewSelector };
