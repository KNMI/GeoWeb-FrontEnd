import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import { TAF_TEMPLATES, TAF_TYPES } from './TafTemplates';
import ResponsiveChangeGroup from './ResponsiveChangeGroup';
import { Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import cloneDeep from 'lodash.clonedeep';

class ResponsiveTafTable extends SortableContainer(() => {}) {
  constructor (props) {
    super(props);
    this.getBaseLine = this.getBaseLine.bind(this);
    this.processValidation = this.processValidation.bind(this);
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

  /**
   * Processes the validationReport into arrays of names of invalid fields
   * @param  {object} validationReport The validation report with JSON-pointers and messages
   * @return {object} An object with arrays for base and changegroup field names
   */
  processValidation (validationReport) {
    const invalidFields = { base: [], changegroup: [] };
    if (validationReport.hasOwnProperty('succeeded') && !validationReport.succeeded) {
      if (validationReport.hasOwnProperty('errors')) {
        Object.keys(validationReport.errors).map((pointer) => {
          const pointerParts = pointer.split('/');
          pointerParts.shift();
          if (pointerParts[0] === 'forecast') {
            invalidFields.base.push(pointerParts.join('-'));
          } else if (pointerParts[0] === 'changegroups' && !isNaN(pointerParts[1])) {
            const groupIndex = parseInt(pointerParts[1]);
            if (!Array.isArray(invalidFields.changegroup[groupIndex])) {
              invalidFields.changegroup[groupIndex] = [];
            }
            invalidFields.changegroup[groupIndex].push(pointerParts.join('-'));
          }
        });
      }
    }
    return invalidFields;
  }

  render () {
    const { taf, focusedFieldName, inputRef, editable, onKeyUp, onKeyDown, onClick, onFocus, onSortEnd, validationReport } = this.props;
    console.log('Props taf', taf, focusedFieldName, inputRef, onSortEnd, validationReport);
    const invalidFields = this.processValidation(validationReport);
    return <Form className='ResponsiveTafTable row' onChange={this.onChange} onKeyUp={onKeyUp} onKeyDown={onKeyDown} onClick={onClick} onFocus={onFocus}>
      <Col style={{ flexDirection: 'column' }}>
        {this.getBaseLine()}
        {taf.hasOwnProperty('changegroups') && Array.isArray(taf.changegroups)
          ? taf.changegroups.map((changegroup, index) =>
            <ResponsiveChangeGroup
              key={`changegroups-${index}`}
              tafChangeGroup={changegroup}
              inputRef={inputRef}
              focusedFieldName={focusedFieldName}
              index={index}
              changeGroupIndex={index}
              editable={editable}
              invalidFields={invalidFields[index] || []} />
          )
          : null}
        {editable
          ? <Row style={{ maxHeight: '2rem' }}>
            <Col />
            <Col xs='auto'>
              <Button size='sm' color='secondary' name={'addible'}>{'\uf067' /* plus icon */}</Button>
            </Col>
          </Row>
          : null
        }
      </Col>
    </Form>;
  }
};

ResponsiveTafTable.defaultProps = {
  taf: cloneDeep(TAF_TEMPLATES.TAF),
  editable: false,
  inputRef: () => {},
  focusedFieldName: null,
  setTafValues: () => {},
  onKeyUp: () => {},
  onKeyDown: () => {},
  onFocus: () => {},
  onSortEnd: () => {},
  validationReport: {
    message: null,
    succeeded: true,
    errors: {}
  }
};

ResponsiveTafTable.propTypes = {
  taf: TAF_TYPES.TAF,
  focusedFieldName: PropTypes.string,
  editable : PropTypes.bool,
  inputRef: PropTypes.func,
  setTafValues: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onSortEnd: PropTypes.func,
  validationReport: PropTypes.shape({
    message: PropTypes.string,
    succeeded: PropTypes.bool,
    errors: PropTypes.object
  })
};

export default ResponsiveTafTable;
