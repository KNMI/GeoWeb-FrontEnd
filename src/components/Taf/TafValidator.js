import axios from 'axios';
/**
 * Validates TAF input in two steps:
 * 1) Check for fallback values
 * 2) Server side validation
 * @param  {object} tafAsObject The TAF JSON to validate
 * @return {object} A report of the validation
 */
const TafValidator = (BACKEND_SERVER_URL, tafAsObject, inputParsingReport) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: BACKEND_SERVER_URL + '/tafs/verify',
      withCredentials: true,
      data: JSON.stringify(tafAsObject),
      headers: { 'Content-Type': 'application/json' }
    }).then(
      response => {
        if (response.data) {
          let responseJson = response.data;
          if (responseJson.hasOwnProperty('errors') && typeof responseJson.errors === 'string') {
            try {
              responseJson.errors = JSON.parse(responseJson.errors);
            } catch (exception) {
              console.error('Unparseable errors data from response', exception);
            }
          }
          const aggregateReport = {
            message: responseJson.message ? responseJson.message : (inputParsingReport.succeeded && responseJson.succeeded ? 'TAF input is verified' : 'TAF input is not valid'),
            succeeded: inputParsingReport.succeeded && responseJson.succeeded,
            errors: Object.assign({}, inputParsingReport.errors, responseJson.errors),
            TAC:responseJson.TAC
          };
          resolve(aggregateReport);
          /* this.setState({
            validationReport: aggregateReport
          }); */
        } else {
          resolve(inputParsingReport);
          /* this.setState({
            validationReport: inputParsingReport
          }); */
        }
      }
    ).catch(error => {
      console.error(error);
      const aggregateReport = {
        message: 'Unable to validate, TAF input is not valid',
        subheading: '(Couldn\'t retrieve all validation details.)',
        succeeded: false,
        errors: inputParsingReport.errors,
        TAC: null
      };
      resolve(aggregateReport);
      /* this.setState({
        validationReport: aggregateReport
      }); */
    });
  });
};

export default TafValidator;
