import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';

export default class TafSelector extends PureComponent {
  render () {
    const { selectableTafs, selectedTaf } = this.props;
    return <Row className='TafSelector'>
      <Col xs='auto'>
        <Typeahead filterBy={['location', 'timeLabel']} labelKey={option => `${option.location} ${option.timeLabel}`}
          options={selectableTafs} onChange={(tafSelection) => { console.log('Selected taf:', tafSelection); }}
          selected={selectedTaf ? [selectedTaf] : []} placeholder={'Select a TAF'}
          renderMenuItemChildren={(option, props, index) => {
            return <Row>
              <Col xs='5'>{option.location}</Col>
              <Col xs='5'>{option.timeLabel}</Col>
              <Col xs='2'><Icon name={option.iconName} /></Col>
            </Row>;
          }}
          clearButton />
      </Col>
    </Row>;
  }
}

TafSelector.propTypes = {
  selectableTafs: PropTypes.arrayOf(PropTypes.shape({
    location: PropTypes.string,
    timeLabel: PropTypes.string,
    timestamp: momentPropTypes.momentObj,
    iconName: PropTypes.string
  })),
  selectedTaf: PropTypes.arrayOf(PropTypes.string)
};
