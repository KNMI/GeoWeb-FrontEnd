import React, { Component, PropTypes } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import SigmetCategory from '../components/SigmetCategory';
import Panel from '../components/Panel';
import { BACKEND_SERVER_URL } from '../routes/ADAGUC/constants/backend';

const GET_SIGMETS_URL = BACKEND_SERVER_URL + '/sigmet/getsigmetlist?';
const SET_SIGMET_URL = BACKEND_SERVER_URL + '/sigmet/storesigmet';
const ITEMS = [
  {
    title: 'Open issued SIGMETs',
    ref:   'active-sigmets',
    icon: 'folder-open',
    source: GET_SIGMETS_URL + 'active=true',
    editable: false
  },
  {
    title: 'Open archived SIGMETs',
    ref:  'archived-sigmets',
    icon: 'archive',
    source: GET_SIGMETS_URL + 'active=false&status=CANCELLED',
    editable: false
  },
  {
    title: 'Open concept SIGMETs',
    ref:   'concept-sigmets',
    icon: 'folder-open-o',
    source: GET_SIGMETS_URL + 'active=false&status=PRODUCTION',
    editable: false
  },
  {
    title: 'Create new SIGMET',
    ref:   'add-sigmet',
    icon: 'star-o',
    source: SET_SIGMET_URL,
    editable: true
  }
];

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.state = { isOpen: true, selectedItem: {}, expandedCategories: [] };
  }

  toggle (evt) {
    this.setState({ isOpen: !this.state.isOpen, selectedItem: {} });
    evt.preventDefault();
  }

  select (category, index) {
    if (typeof this.state.selectedItem.index !== 'undefined' &&
        this.state.selectedItem.category === category && this.state.selectedItem.index === index) {
      this.setState({ selectedItem: {} });
      return false;
    } else {
      this.setState({ selectedItem: { category: category, index: index } });
      return true;
    }
  }

  render () {
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
    </Row>;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={400}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper'>
              {ITEMS.map((item, index) =>
                <SigmetCategory adagucProperties={this.props.adagucProperties}
                  dispatch={this.props.dispatch} actions={this.props.actions} key={index} title={item.title} parentCollapsed={!this.state.isOpen}
                  icon={item.icon} source={item.source} editable={item.editable}
                  isOpen={this.state.isOpen && typeof this.state.selectedItem.index !== 'undefined' && this.state.selectedItem.category === item.ref}
                  selectedIndex={typeof this.state.selectedItem.index !== 'undefined' && this.state.selectedItem.category === item.ref ? this.state.selectedItem.index : -1}
                  selectMethod={(index) => this.select(item.ref, index)} />
              )}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {
  adagucProperties: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object
};

export default SigmetsContainer;
