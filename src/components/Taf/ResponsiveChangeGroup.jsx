import React, { PureComponent } from 'react';
// import { Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { TAF_TEMPLATES, TAF_TYPES } from './TafTemplates';
import ResponsiveTafCell from './ResponsiveTafCell';
import cloneDeep from 'lodash.clonedeep';
import { jsonToTacForPeriod, jsonToTacForProbability, jsonToTacForChangeType, jsonToTacForWind, jsonToTacForCavok,
  jsonToTacForVerticalVisibility, jsonToTacForVisibility, jsonToTacForWeather, jsonToTacForClouds } from './TafFieldsConverter';

/*
  ResponsiveChangeGroup of TAF editor
*/
class ResponsiveChangeGroup extends PureComponent {
  render () {
    const { tafChangeGroup, focusedFieldName, inputRef, index, editable, invalidFields } = this.props;
    const columns = [
      {
        name: 'changegroups-' + index + '-probability',
        value: tafChangeGroup.hasOwnProperty('changeType') ? jsonToTacForProbability(tafChangeGroup.changeType, true) || '' : '',
        disabled: false,
        classes: []
      },
      {
        name: 'changegroups-' + index + '-change',
        value: tafChangeGroup.hasOwnProperty('changeType') ? jsonToTacForChangeType(tafChangeGroup.changeType, true) || '' : '',
        disabled: false,
        classes: []
      },
      {
        name: 'changegroups-' + index + '-validity',
        value: tafChangeGroup.hasOwnProperty('changeStart') && tafChangeGroup.hasOwnProperty('changeEnd') ? jsonToTacForPeriod(tafChangeGroup.changeStart, tafChangeGroup.changeEnd, true) || '' : '',
        disabled: false,
        classes: []
      },
      {
        name: 'changegroups-' + index + '-forecast-wind',
        value: tafChangeGroup.hasOwnProperty('forecast') && tafChangeGroup.forecast.hasOwnProperty('wind') ? jsonToTacForWind(tafChangeGroup.forecast.wind, true) || '' : '',
        disabled: !editable,
        classes: []
      },
      {
        name: 'changegroups-' + index + '-forecast-visibility',
        value: (tafChangeGroup.hasOwnProperty('forecast') && (tafChangeGroup.forecast.hasOwnProperty('caVOK') || tafChangeGroup.forecast.hasOwnProperty('visibility')))
          ? jsonToTacForCavok(tafChangeGroup.forecast.caVOK) || (jsonToTacForVisibility(tafChangeGroup.forecast.visibility, true) || '')
          : '',
        disabled: !editable,
        classes: []
      }
    ];
    for (let weatherIndex = 0; weatherIndex < 3; weatherIndex++) {
      columns.push({
        name: 'changegroups-' + index + '-forecast-weather-' + weatherIndex,
        value: (tafChangeGroup.hasOwnProperty('forecast') && tafChangeGroup.forecast.hasOwnProperty('weather'))
          ? (Array.isArray(tafChangeGroup.forecast.weather) && tafChangeGroup.forecast.weather.length > weatherIndex
            ? jsonToTacForWeather(tafChangeGroup.forecast.weather[weatherIndex], true) || ''
            : weatherIndex === 0
              ? jsonToTacForWeather(tafChangeGroup.forecast.weather, true) || '' // NSW
              : '')
          : '',
        disabled: !editable || (jsonToTacForWeather(tafChangeGroup.forecast.weather) && weatherIndex !== 0),
        classes: []
      });
    }
    for (let cloudsIndex = 0; cloudsIndex < 4; cloudsIndex++) {
      columns.push({
        name: 'changegroups-' + index + '-forecast-clouds-' + cloudsIndex,
        value: (tafChangeGroup.hasOwnProperty('forecast') && (tafChangeGroup.forecast.hasOwnProperty('vertical_visibility') || tafChangeGroup.forecast.hasOwnProperty('clouds')))
          ? jsonToTacForVerticalVisibility(tafChangeGroup.forecast.vertical_visibility) ||
            (Array.isArray(tafChangeGroup.forecast.clouds) && tafChangeGroup.forecast.clouds.length > cloudsIndex
              ? jsonToTacForClouds(tafChangeGroup.forecast.clouds[cloudsIndex], true) || ''
              : cloudsIndex === 0
                ? jsonToTacForClouds(tafChangeGroup.forecast.clouds, true) || '' // NSC
                : '')
          : '',
        disabled: !editable || (jsonToTacForClouds(tafChangeGroup.forecast.clouds) && cloudsIndex !== 0) ||
          (jsonToTacForVerticalVisibility(tafChangeGroup.forecast.vertical_visibility) && cloudsIndex !== 0),
        classes: [ (jsonToTacForVerticalVisibility(tafChangeGroup.forecast.vertical_visibility) && cloudsIndex !== 0) ? 'hideValue' : null ]
      });
    }
    columns.push(
      {
        name: 'changegroups-' + index + '-removable',
        value: editable ? '\uf00d' : '', // the remove icon
        disabled: !editable,
        isButton: true,
        classes: [ 'noselect' ]
      }
    );
    columns.forEach((column) => {
      column.autoFocus = column.name === focusedFieldName;
      let name = column.name;
      if (name.endsWith('probability') || name.endsWith('change')) {
        const nameParts = name.split('-');
        nameParts.pop();
        nameParts.push('changeType');
        name = nameParts.join('-');
      }
      if (name.endsWith('validity')) {
        const nameParts = name.split('-');
        nameParts.pop();
        nameParts.push('changeStart');
        name = nameParts.join('-');
      }
      let isInvalid = invalidFields.includes(name);
      column.invalid = isInvalid;
      if (isInvalid) {
        column.classes.push('TACColumnError');
      }
    });

    return <Row className='changegroup' key={'changeGroupLine-' + index}>
      {columns.map((col) =>
        <ResponsiveTafCell classes={col.classes} key={col.name} name={col.name} value={col.value} inputRef={inputRef}
          disabled={col.disabled} autoFocus={col.autoFocus} isSpan={col.isSpan} isButton={col.isButton} />
      )}
    </Row>;
  }
};

/* return <Row className='changegroup' key={'changeGroupLine-' + index}>
      <FormGroup className='col-1'>
        <Label for={'changegroups-' + index + '-changeType-prob'} size='sm' hidden={index !== 0}>Prob</Label>
        <Input type='text' name={'changegroups-' + index + '-changeType-prob'} id={'changegroups-' + index + '-changeType-prob'} placeholder={index === 0 ? 'probability' : ''} size='sm' />
      </FormGroup>
      <FormGroup className='col-1'>
        <Label for={'changegroups-' + index + '-changeType-change'} size='sm' hidden={index !== 0}>Change</Label>
        <Input type='text' name={'changegroups-' + index + '-changeType-change'} id={'changegroups-' + index + '-changeType-change'} placeholder={index === 0 ? 'persistency' : ''} size='sm' />
      </FormGroup>
      <FormGroup className='col-1'>
        <Label for={'changegroups-' + index + '-changePeriod'} size='sm' hidden={index !== 0}>Valid period</Label>
        <Row>
          <Col>
            <Label for={'changegroups-' + index + '-changeStart'} size='sm' hidden>Start</Label>
            <Input type='text' name={'changegroups-' + index + '-changeStart'} id={'changegroups-' + index + '-changeStart'} placeholder={index === 0 ? 'start' : ''} size='sm' />
          </Col>
          <Col xs='auto'>/</Col>
          <Col>
            <Label for={'changegroups-' + index + '-changeEnd'} size='sm' hidden>End</Label>
            <Input type='text' name={'changegroups-' + index + '-changeEnd'} id={'changegroups-' + index + '-changeEnd'} placeholder={index === 0 ? 'end' : ''} size='sm' />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup className='col-1'>
        <Label className='wind' for={'changegroups-' + index + '-forecast-wind'} size='sm' hidden={index !== 0}>Wind</Label>
        <Input type='text' name={'changegroups-' + index + '-forecast-wind'} id={'changegroups-' + index + '-forecast-wind'} placeholder={index === 0 ? 'wind' : ''} size='sm' />
      </FormGroup>
      <FormGroup className='col-1'>
        <Label className='visibility' for={'changegroups-' + index + '-forecast-visibility'} size='sm' hidden={index !== 0}>Visibility</Label>
        <Input type='text' name={'changegroups-' + index + '-forecast-visibility'} id={'changegroups-' + index + '-forecast-visibility'} placeholder={index === 0 ? 'visibility' : ''} size='sm' />
      </FormGroup>
      <FormGroup className='col-3'>
        <Label className='weather' for='weather' size='sm' hidden={index !== 0}>Weather</Label>
        <Row>
          <Col>
            <Label for={'changegroups-' + index + '-forecast-weather-1'} size='sm' hidden>Weather 1</Label>
            <Input type='text' name={'changegroups-' + index + '-forecast-weather-1'} id={'changegroups-' + index + '-forecast-weather-1'} placeholder={index === 0 ? 'weather-1' : ''} size='sm' />
          </Col>
          <Col>
            <Label for={'changegroups-' + index + '-forecast-weather-2'} size='sm' hidden>Weather 2</Label>
            <Input type='text' name={'changegroups-' + index + '-forecast-weather-2'} id={'changegroups-' + index + '-forecast-weather-2'} placeholder={index === 0 ? 'weather-2' : ''} size='sm' />
          </Col>
          <Col>
            <Label for={'changegroups-' + index + '-forecast-weather-3'} size='sm' hidden>Weather 3</Label>
            <Input type='text' name={'changegroups-' + index + '-forecast-weather-3'} id={'changegroups-' + index + '-forecast-weather-3'} placeholder={index === 0 ? 'weather-3' : ''} size='sm' />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup className='col-4'>
        <Label className='clouds' for={'changegroups-' + index + '-forecast-clouds'} size='sm' hidden={index !== 0}>Clouds</Label>
        <Row>
          <Col>
            <Label for={'changegroups-' + index + '-forecast-clouds-1'} size='sm' hidden>Clouds 1</Label>
            <Input type='text' name={'changegroups-' + index + '-forecast-clouds-1'} id={'changegroups-' + index + '-forecast-clouds-1'} placeholder={index === 0 ? 'clouds-1' : ''} size='sm' />
          </Col>
          <Col>
            <Label for={'changegroups-' + index + '-forecast-clouds-2'} size='sm' hidden>Clouds 2</Label>
            <Input type='text' name={'changegroups-' + index + '-forecast-clouds-2'} id={'changegroups-' + index + '-forecast-clouds-2'} placeholder={index === 0 ? 'clouds-2' : ''} size='sm' />
          </Col>
          <Col>
            <Label for={'changegroups-' + index + '-forecast-clouds-3'} size='sm' hidden>Clouds 3</Label>
            <Input type='text' name={'changegroups-' + index + '-forecast-clouds-3'} id={'changegroups-' + index + '-forecast-clouds-3'} placeholder={index === 0 ? 'clouds-3' : ''} size='sm' />
          </Col>
          <Col>
            <Label for={'changegroups-' + index + '-forecast-clouds-4'} size='sm' hidden>Clouds 4</Label>
            <Input type='text' name={'changegroups-' + index + '-forecast-clouds-4'} id={'changegroups-' + index + '-forecast-clouds-4'} placeholder={index === 0 ? 'clouds-4' : ''} size='sm' />
          </Col>
        </Row>
      </FormGroup>
    </Row>; */

ResponsiveChangeGroup.defaultProps = {
  tafChangeGroup: cloneDeep(TAF_TEMPLATES.CHANGE_GROUP),
  focusedFieldName: null,
  inputRef: () => {},
  index: -1,
  editable : false,
  invalidFields: []
};

ResponsiveChangeGroup.propTypes = {
  tafChangeGroup: TAF_TYPES.CHANGE_GROUP.isRequired,
  focusedFieldName: PropTypes.string,
  inputRef: PropTypes.func,
  index: PropTypes.number,
  editable : PropTypes.bool,
  invalidFields: PropTypes.array
};

export default ResponsiveChangeGroup;
