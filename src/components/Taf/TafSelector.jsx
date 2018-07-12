import React, { PureComponent } from 'react';
import { Row, Col, Alert } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Icon } from 'react-fa';
import { TAF_TYPES } from './TafTemplates';
import PropTypes from 'prop-types';

export default class TafSelector extends PureComponent {
  constructor (props) {
    super(props);
    this.equalsLocationOrTime = this.equalsLocationOrTime.bind(this);
  }

  equalsLocationOrTime (option, props) {
    return option.location.toUpperCase().indexOf(props.text.toUpperCase()) !== -1 ||
      option.label.time.indexOf(props.text) !== -1 ||
      option.label.status.toLowerCase().indexOf(props.text.toLowerCase()) !== -1;
  }

  render () {
    const { selectableTafs, selectedTaf, onChange } = this.props;
    return <Row className='TafSelector'>
      <Col xs='auto'>TAF for</Col>
      <Col xs='3'>
        <Typeahead
          filterBy={this.equalsLocationOrTime}
          labelKey={option => `${option.label.text} ${option.label.status}`}
          options={selectableTafs} onChange={onChange} onFocus={() => onChange([])}
          selected={selectedTaf || []} placeholder={'Select a TAF'}
          renderMenuItemChildren={(option, props, index) => {
            return <Row>
              <Col xs='1'><Icon name={option.label.icon} /></Col>
              <Col xs='2'>{option.location}</Col>
              <Col xs='2'>{option.label.time}</Col>
              <Col xs='7'>{option.label.status}</Col>
            </Row>;
          }}
          clearButton />
      </Col>
      {!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length === 0
        ? <Col xs='4'>
          <Alert color={'warning'}>
            <Icon name='exclamation-triangle' /> Currently, no TAF is selected.
          </Alert>
        </Col>
        : null
      }
    </Row>;
  }
}

TafSelector.propTypes = {
  selectableTafs: PropTypes.arrayOf(TAF_TYPES.SELECTABLE_TAF),
  selectedTaf: PropTypes.arrayOf(TAF_TYPES.SELECTABLE_TAF),
  onChange: PropTypes.func
};
