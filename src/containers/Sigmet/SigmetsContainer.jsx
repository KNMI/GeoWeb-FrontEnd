import React, { Component } from 'react';
import { Col } from 'reactstrap';
import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { LOCAL_ACTION_TYPES, LOCAL_ACTIONS } from './SigmetActions';
import ContainerHeader from './ContainerHeader';
import SigmetsCategory from '../../components/Sigmet/SigmetsCategory';
import MinifiedCategory from '../../components/Sigmet/MinifiedCategory';

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.toggleContainer = this.toggleContainer.bind(this);
    this.state = {
      categories: [
        {
          title: 'Open active SIGMETs',
          ref: 'active-sigmets',
          icon: 'folder-open',
          sigmets: [],
          allowedActions: {
            isEditable: false,
            isPublishable: false,
            isCancelable: true,
            isDeletable: false
          }
        },
        {
          title: 'Open concept SIGMETs',
          ref: 'concept-sigmets',
          icon: 'folder-open-o',
          sigmets: [],
          allowedActions: {
            isEditable: true,
            isPublishable: true,
            isCancelable: false,
            isDeletable: true
          }
        },
        {
          title: 'Create new SIGMET',
          ref: 'add-sigmet',
          icon: 'star-o',
          sigmets: [],
          allowedActions: {
            isEditable: true,
            isPublishable: false,
            isCancelable: false,
            isDeletable: true
          }
        },
        {
          title: 'Open archived SIGMETs',
          ref: 'archived-sigmets',
          icon: 'archive',
          sigmets: [],
          allowedActions: {
            isEditable: false,
            isPublishable: false,
            isCancelable: false,
            isDeletable: false
          }
        }
      ],
      phenomena: [],
      parameters: {},
      focussedCategoryRef: 'add-sigmet',
      focussedSigmetIndex: 0,
      isContainerOpen: true
    };
  }

  localDispatch (localAction) {
    switch (localAction.type) {
      case LOCAL_ACTION_TYPES.TOGGLE_CONTAINER:
        this.toggleContainer(localAction.event);
        break;
    }
  }

  toggleContainer (evt) {
    this.setState({ isContainerOpen: !this.state.isContainerOpen });
    this.setState({ isOpen: !this.state.isOpen });
    evt.preventDefault();
  }

  render () {
    const maxSize = 520;
    const header = <ContainerHeader isContainerOpen={this.state.isContainerOpen} dispatch={this.localDispatch} actions={LOCAL_ACTIONS} />;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isContainerOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={header}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: this.state.isContainerOpen ? maxSize - 32 : 'unset' }}>
              {this.state.categories.map((category) => {
                return this.state.isContainerOpen
                  ? <SigmetsCategory key={category.ref} title={category.title} icon={category.icon} isOpen={this.state.focussedCategoryRef === category.ref} sigmets={category.sigmets} />
                  : <MinifiedCategory key={category.ref} icon={category.icon} count={category.sigmets.length} />;
              })}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {

};

export default SigmetsContainer;
