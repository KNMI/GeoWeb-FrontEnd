import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import { TAF_TEMPLATES, TAF_TYPES } from './TafTemplates';
import { Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';

class TACTable extends SortableContainer(() => {}) {
  constructor (props) {
    super(props);
    this.getBaseLine = this.getBaseLine.bind(this);
    this.getChangeGroupLine = this.getChangeGroupLine.bind(this);
  }

  getBaseLine () {
    return <Row className='base'>
      <FormGroup className='col-1'>
        <Label for='metadata-location' size='sm'>Location</Label>
        <Input type='text' name='metadata-location' id='metadata-location' placeholder='EHAM' size='sm' disabled />
      </FormGroup>
      <FormGroup className='col-1'>
        <Label for='metadata-issueTime' size='sm'>Issue time</Label>
        <Input type='text' name='metadata-issueTime' id='metadata-issueTime' placeholder='t.b.d.' size='sm' disabled />
      </FormGroup>
      <FormGroup className='col-1'>
        <Label for='metadata-validity' size='sm'>Valid period</Label>
        <Row>
          <Col>
            <Label for='metadata-validityStart' size='sm' hidden>start</Label>
            <Input type='text' autoFocus name='metadata-validityStart' id='metadata-validityStart' placeholder='start' size='sm' />
          </Col>
          <Col xs='auto'>/</Col>
          <Col>
            <Label for='metadata-validityEnd' size='sm' hidden>end</Label>
            <Input type='text' name='metadata-validityEnd' id='metadata-validityEnd' placeholder='end' size='sm' />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup className='col-1'>
        <Label className='wind' for='forecast-wind' size='sm'>Wind</Label>
        <Input type='text' name='forecast-wind' id='forecast-wind' placeholder='wind' size='sm' />
      </FormGroup>
      <FormGroup className='col-1'>
        <Label className='visibility' for='forecast-visibility' size='sm'>Visibility</Label>
        <Input type='text' name='forecast-visibility' id='forecast-visibility' placeholder='visibility' size='sm' />
      </FormGroup>
      <FormGroup className='col-3'>
        <Label className='weather' for='weather' size='sm'>Weather</Label>
        <Row>
          <Col>
            <Label for='forecast-weather-1' size='sm' hidden>Weather 1</Label>
            <Input type='text' name='forecast-weather-1' id='forecast-weather-1' placeholder='weather 1' size='sm' />
          </Col>
          <Col>
            <Label for='forecast-weather-2' size='sm' hidden>Weather 2</Label>
            <Input type='text' name='forecast-weather-2' id='forecast-weather-2' placeholder='weather 2' size='sm' />
          </Col>
          <Col>
            <Label for='forecast-weather-3' size='sm' hidden>Weather 3</Label>
            <Input type='text' name='forecast-weather-3' id='forecast-weather-3' placeholder='weather 3' size='sm' />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup className='col-4'>
        <Label className='clouds' for='forecast-clouds' size='sm'>Clouds</Label>
        <Row>
          <Col>
            <Label for='forecast-clouds-1' size='sm' hidden>Clouds 1</Label>
            <Input type='text' name='forecast-clouds-1' id='forecast-clouds-1' placeholder='clouds 1' size='sm' />
          </Col>
          <Col>
            <Label for='forecast-clouds-2' size='sm' hidden>Clouds 2</Label>
            <Input type='text' name='forecast-clouds-2' id='forecast-clouds-2' placeholder='clouds 2' size='sm' />
          </Col>
          <Col>
            <Label for='forecast-clouds-3' size='sm' hidden>Clouds 3</Label>
            <Input type='text' name='forecast-clouds-3' id='forecast-clouds-3' placeholder='clouds 3' size='sm' />
          </Col>
          <Col>
            <Label for='forecast-clouds-4' size='sm' hidden>Clouds 4</Label>
            <Input type='text' name='forecast-clouds-4' id='forecast-clouds-4' placeholder='clouds 4' size='sm' />
          </Col>
        </Row>
      </FormGroup>
    </Row>;
  }

  getChangeGroupLine (changegroup, index) {
    return <Row className='changegroup' key={'changeGroupLine-' + index}>
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
    </Row>;
  }

  render () {
    const { tafAsObject, onChange } = this.props;
    console.log('Props taf', tafAsObject);
    return <Form className='TACTable row' onChange={onChange} onKeyUp={onChange} onBlur={onChange} onInput={onChange}>
      <Col style={{ flexDirection: 'column' }}>
        {this.getBaseLine()}
        {tafAsObject.hasOwnProperty('changegroups') && Array.isArray(tafAsObject.changegroups)
          ? tafAsObject.changegroups.map((changegroup, index) => {
            return this.getChangeGroupLine(changegroup, index);
          })
          : null}
      </Col>
    </Form>;
  }
};

TACTable.defaultProps = TAF_TEMPLATES.TAF;

TACTable.propTypes = {
  tafAsObject: TAF_TYPES.TAF,
  onChange: PropTypes.func
};

export default TACTable;
