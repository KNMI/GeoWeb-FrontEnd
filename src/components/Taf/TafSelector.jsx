import React, { PureComponent } from 'react';
import { Row, Col, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Icon } from 'react-fa';
import { TAF_TYPES, TIMELABEL_FORMAT } from './TafTemplates';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class TafSelector extends PureComponent {
  constructor (props) {
    super(props);
    this.equalsLocationOrTime = this.equalsLocationOrTime.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  equalsLocationOrTime (option, props) {
    return option.location.toUpperCase().indexOf(props.text.toUpperCase()) !== -1 ||
      option.label.time.indexOf(props.text) !== -1 ||
      option.label.status.toLowerCase().indexOf(props.text.toLowerCase()) !== -1;
  }

  toggle () {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  renderTaf (taf) {
    let baseTime = taf.label.time;
    if (taf && taf.tafData && taf.tafData.metadata && taf.tafData.metadata.baseTime) {
      const formattedBaseTime = moment.utc(taf.tafData.metadata.baseTime).format(TIMELABEL_FORMAT);
      const formattedValidityStart = moment.utc(taf.tafData.metadata.validityStart).format(TIMELABEL_FORMAT);
      if (formattedBaseTime !== formattedValidityStart) {
        baseTime = formattedBaseTime + ' -> ' + formattedValidityStart;
      }
    }
    return (<Row style={{ display: 'inline-block', cursor: 'pointer', width: '100%' }}>
      <Col xs='1'><Icon name={taf.label.icon} /></Col>
      <Col xs='2'>{taf.location}</Col>
      <Col xs='2'>{baseTime}</Col>
      <Col xs='2'>{taf.label.date}</Col>
      <Col xs='5'>{taf.label.status}</Col>
    </Row>);
  }
  renderTafs (tafs, selectTaf) {
    /**
     * Sort the tafs based on location and start time.
     * @param {*} tafA
     * @param {*} tafB
     */
    const tafSortingFunction = (tafA, tafB) => {
      if (tafA.location < tafB.location) return -1;
      if (tafA.location > tafB.location) return 1;
      if (tafA.tafData && tafA.tafData.metadata && tafA.tafData.metadata.validityStart &&
        tafB.tafData && tafB.tafData.metadata && tafB.tafData.metadata.validityStart) {
        const baseTimeA = tafA.tafData.metadata.baseTime || tafA.tafData.metadata.validityStart;
        const baseTimeB = tafB.tafData.metadata.baseTime || tafB.tafData.metadata.validityStart;
        if (baseTimeA < baseTimeB) return -1;
        if (baseTimeA > baseTimeB) return 1;
      }
      return 0;
    };
    return tafs.sort(tafSortingFunction).map((taf, key) => {
      return (<DropdownItem key={key} onClick={() => { selectTaf([taf]); }} style={{ width: '100%' }}>
        { this.renderTaf(taf) }
      </DropdownItem>);
    });
  }
  render () {
    const { selectableTafs, selectedTaf, onChange } = this.props;
    return <Row className='TafSelector'>
      <Col xs='7'>
        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} style={{ width: '800px' }}>
          <DropdownToggle caret style={{ width: '100%', color: 'black' }}>
            { selectedTaf && selectedTaf.length === 1 ? this.renderTaf(selectedTaf[0]) : 'Select a TAF' }
          </DropdownToggle>
          <DropdownMenu style={{ width: '800px', paddingLeft: '10px' }}>
            <Button style={{ float: 'right' }} color='link' onClick={() => { const { dispatch, actions } = this.props; dispatch(actions.updateTafsAction()); }}>
              <abbr style={{ cursor: 'pointer' }} title='Refresh the list of TAFs'><Icon name='refresh' /></abbr>
            </Button>

            <DropdownItem header>Published TAF's</DropdownItem>
            { this.renderTafs(selectableTafs.filter(taf => taf.tafData.metadata.status === 'published'), onChange) }
            <DropdownItem divider />
            <DropdownItem header>TAF's todo</DropdownItem>
            { this.renderTafs(selectableTafs.filter(taf => taf.tafData.metadata.status !== 'published'), onChange) }
          </DropdownMenu>
        </Dropdown>
      </Col>
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
