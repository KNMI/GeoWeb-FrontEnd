import React, { PureComponent } from 'react';
import { Row, Col, Alert } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Icon } from 'react-fa';
import { TAF_TYPES } from './TafTemplates';
import { MODALS } from '../../containers/Taf/TafActions';
import PropTypes from 'prop-types';

export default class TafSelector extends PureComponent {
  constructor (props) {
    super(props);
    this.equalsLocationOrTime = this.equalsLocationOrTime.bind(this);
    this.triggerModal = this.triggerModal.bind(this);
  }

  equalsLocationOrTime (option, props) {
    return option.location.toUpperCase().indexOf(props.text.toUpperCase()) !== -1 ||
      option.label.time.indexOf(props.text) !== -1 ||
      option.label.status.toLowerCase().indexOf(props.text.toLowerCase()) !== -1;
  }

  triggerModal (evt) {
    const { onChange, dispatch, actions, selectedTaf } = this.props;
    evt.preventDefault();
    evt.stopPropagation();
    if (!Array.isArray(selectedTaf) || selectedTaf.length === 0) {
      return;
    }
    if (!selectedTaf[0].hasEdits) {
      onChange([]);
      return;
    }
    dispatch(actions.toggleTafModalAction(evt, MODALS.CONFIRM_SWITCH.type));
  }

  render () {
    const { selectableTafs, selectedTaf, onChange } = this.props;
    return <Row className='TafSelector'>
      <Col xs='auto'>TAF for</Col>
      <Col xs='3'>
        <Typeahead
          filterBy={this.equalsLocationOrTime}
          labelKey={option => `${option.label.text} ${option.label.status}`}
          options={selectableTafs} onChange={onChange} onFocus={this.triggerModal}
          selected={selectedTaf || []} placeholder={'Select a TAF'}
          renderMenuItemChildren={(option, props, index) => {
            return <Row>
              <Col xs='1'><Icon name={option.label.icon} /></Col>
              <Col xs='2'>{option.location}</Col>
              <Col xs='2'>{option.label.time}</Col>
              <Col xs='2'>{option.label.date}</Col>
              <Col xs='5'>{option.label.status}</Col>
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
  onChange: PropTypes.func,
  dispatch: PropTypes.func,
  actions: PropTypes.objectOf(PropTypes.func)
};
