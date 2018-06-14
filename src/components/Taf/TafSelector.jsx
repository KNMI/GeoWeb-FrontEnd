import React, { PureComponent } from 'react';
import { Row, Col, Alert } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';

export default class TafSelector extends PureComponent {
  render () {
    const { selectableTafs, selectedTaf, onChange } = this.props;
    return <Row className='TafSelector'>
      <Col xs='auto'>TAF for</Col>
      <Col xs='auto'>
        <Typeahead labelKey={option => option.label.text}
          options={selectableTafs} onChange={onChange}
          selected={selectedTaf || []} placeholder={'Select a TAF'}
          renderMenuItemChildren={(option, props, index) => {
            return <Row>
              <Col xs='5'>{option.location}</Col>
              <Col xs='5'>{option.label.time}</Col>
              <Col xs='2'><Icon name={option.label.icon} /></Col>
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
  selectableTafs: PropTypes.arrayOf(PropTypes.shape({
    location: PropTypes.string,
    timeLabel: PropTypes.string,
    timestamp: momentPropTypes.momentObj,
    status: PropTypes.string
  })),
  selectedTaf: PropTypes.arrayOf(PropTypes.shape({
    location: PropTypes.string,
    timeLabel: PropTypes.string,
    timestamp: momentPropTypes.momentObj,
    status: PropTypes.string
  })),
  onChange: PropTypes.func
};
