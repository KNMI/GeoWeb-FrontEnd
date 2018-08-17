import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import { TAF_TYPES } from './TafTemplates';
import {
  jsonToTacForType, jsonToTacForProbability, jsonToTacForChangeType, jsonToTacForPeriod,
  jsonToTacForIssue, jsonToTacForWind, jsonToTacForCavok, jsonToTacForVerticalVisibility,
  jsonToTacForVisibility, jsonToTacForWeather, jsonToTacForClouds
} from './TafFieldsConverter';

export default class TacView extends PureComponent {
  render () {
    const { taf } = this.props;
    const reduceWeather = (weather) => (Array.isArray(weather) && weather.length > 0)
      ? weather.reduce((result, weatherItem) => `${result} ${jsonToTacForWeather(weatherItem) || ''}`, '')
      : '';
    const reduceClouds = (clouds) => (Array.isArray(clouds) && clouds.length > 0)
      ? clouds.reduce((result, cloudsItem) => `${result} ${jsonToTacForClouds(cloudsItem) || ''}`, '')
      : (jsonToTacForClouds(clouds) || '');
    const tac = {
      type: jsonToTacForType(taf.metadata.type) || '',
      location: taf.metadata.location || '',
      issueTime: jsonToTacForIssue(taf.metadata.issueTime) || '',
      period: jsonToTacForPeriod(taf.metadata.validityStart, taf.metadata.validityEnd) || '',
      wind: jsonToTacForWind(taf.forecast.wind, false, true) || '',
      visibility: jsonToTacForVisibility(taf.forecast.visibility) || '',
      cavok: jsonToTacForCavok(taf.forecast.caVOK) || '',
      weather: reduceWeather(taf.forecast.weather),
      clouds: reduceClouds(taf.forecast.clouds),
      vertical_visibility: jsonToTacForVerticalVisibility(taf.forecast.vertical_visibility) || '',
      changegroups: []
    };
    if (tac.issueTime === 'not yet issued') {
      tac.issueTime = `<${tac.issueTime}>`;
    }
    if (Array.isArray(taf.changegroups)) {
      taf.changegroups.map((changegroup) => {
        tac.changegroups.push({
          probability: jsonToTacForProbability(changegroup.changeType) || '',
          changeType: jsonToTacForChangeType(changegroup.changeType) || '',
          period: jsonToTacForPeriod(changegroup.changeStart, changegroup.changeEnd) || '',
          wind: jsonToTacForWind(changegroup.forecast.wind, false, true) || '',
          visibility: jsonToTacForVisibility(changegroup.forecast.visibility) || '',
          cavok: jsonToTacForCavok(changegroup.forecast.caVOK) || '',
          weather: reduceWeather(changegroup.forecast.weather),
          clouds: reduceClouds(changegroup.forecast.clouds),
          vertical_visibility: jsonToTacForVerticalVisibility(changegroup.forecast.vertical_visibility) || ''
        });
      });
    }

    return <Row className='TacView'>
      <Col xs='6'>
        <Row>
          <Col xs='1'>
            TAC
          </Col>
          <Col xs='auto'>
            {`TAF ${tac.type} ${tac.location} ${tac.issueTime} ${tac.period} ${tac.wind} ${tac.visibility} ${tac.cavok} ${tac.weather}
            ${tac.clouds} ${tac.vertical_visibility}`}</Col>
        </Row>
        {tac.changegroups.map((chg, index) =>
          <Row key={`changegroup-${index}`}>
            <Col xs={{ size: 'auto', offset: 1 }}>
              {`${chg.probability} ${chg.changeType} ${chg.period} ${chg.wind} ${chg.visibility} ${chg.cavok} ${chg.weather}
              ${chg.clouds} ${chg.vertical_visibility}`}</Col>
          </Row>
        )}
      </Col>
    </Row>;
  }
}

TacView.propTypes = {
  taf: TAF_TYPES.TAF
};
