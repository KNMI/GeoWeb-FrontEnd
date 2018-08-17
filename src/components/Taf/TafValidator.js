import cloneDeep from 'lodash.clonedeep';
import setNestedProperty from 'lodash.set';
import getNestedProperty from 'lodash.get';
import removeNestedProperty from 'lodash.unset';
import axios from 'axios';
import { getJsonPointers, clearNullPointersAndAncestors, removeNulls } from '../../utils/json';
/**
 * Validates TAF input in two steps:
 * 1) Check for fallback values
 * 2) Server side validation
 * @param  {object} tafAsObject The TAF JSON to validate
 * @return {object} A report of the validation
 */
const TafValidator = (BACKEND_SERVER_URL, tafAsObject) => {
  return new Promise((resolve, reject) => {
    const taf = cloneDeep(tafAsObject);
    const fallbackPointers = [];
    getJsonPointers(taf, (field) => field && field.hasOwnProperty('fallback'), fallbackPointers);

    const inputParsingReport = {};
    const fallbackPointersLength = fallbackPointers.length;
    if (fallbackPointersLength > 0) {
      inputParsingReport.message = 'TAF is not valid';
      inputParsingReport.succeeded = false;
      for (let pointerIndex = 0; pointerIndex < fallbackPointersLength; pointerIndex++) {
        if (!inputParsingReport.hasOwnProperty('errors')) {
          inputParsingReport.errors = {};
        }
        if (!inputParsingReport.errors.hasOwnProperty(fallbackPointers[pointerIndex])) {
          inputParsingReport.errors[fallbackPointers[pointerIndex]] = [];
        }
        const pointerParts = fallbackPointers[pointerIndex].split('/');
        pointerParts.shift();
        let message = 'The pattern of the input was not recognized.';
        const fallbackedProperty = getNestedProperty(taf, pointerParts);
        if (fallbackedProperty.hasOwnProperty('fallback') && fallbackedProperty.fallback.hasOwnProperty('message')) {
          message = fallbackedProperty.fallback.message;
        }
        inputParsingReport.errors[fallbackPointers[pointerIndex]].push(message);
        removeNestedProperty(taf, pointerParts);
      }
    } else {
      inputParsingReport.message = 'TAF input is verified';
      inputParsingReport.succeeded = true;
    }

    clearNullPointersAndAncestors(taf); // TODO: Check this function does not clean all nulls

    let cleanedTaf = removeNulls(taf);

    if (!getNestedProperty(cleanedTaf, ['changegroups'])) {
      setNestedProperty(cleanedTaf, ['changegroups'], []);
    }
    // if (getNestedProperty(cleanedTaf, ['metadata', 'issueTime']) === 'not yet issued') {
    //   setNestedProperty(cleanedTaf, ['metadata', 'issueTime'], moment.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z');
    // }

    /* TODO: Temporary fixes for validation */
    if (cleanedTaf.metadata) {
      cleanedTaf.metadata.status = cleanedTaf.metadata.status.toLowerCase();
      cleanedTaf.metadata.type = cleanedTaf.metadata.type.toLowerCase();
    }
    if (cleanedTaf.metadata.status === 'new') {
      delete cleanedTaf.metadata.status;
    }

    axios({
      method: 'post',
      url: BACKEND_SERVER_URL + '/tafs/verify',
      withCredentials: true,
      data: JSON.stringify(cleanedTaf),
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
            errors: Object.assign({}, inputParsingReport.errors, responseJson.errors)
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
        message: 'TAF input is not valid',
        subheading: '(Couldn\'t retrieve all validation details.)',
        succeeded: false,
        errors: inputParsingReport.errors
      };
      resolve(aggregateReport);
      /* this.setState({
        validationReport: aggregateReport
      }); */
    });
  });
};

export default TafValidator;
