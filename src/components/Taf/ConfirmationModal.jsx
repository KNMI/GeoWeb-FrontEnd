import React, { PureComponent } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';

export default class ConfirmationModal extends PureComponent {
  render () {
    const { config, dispatch, actions, identifier } = this.props;
    return <Modal className='ConfirmationModal' isOpen toggle={(evt) => dispatch(actions[config.toggleAction](evt, config.type))}>
      <ModalHeader>{config.title}</ModalHeader>
      <ModalBody>
        <Row>
          <Col>{config.message(identifier)}</Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Row>
          <Col xs={{ size: 6, offset: 6 }}>
            <Button color='primary' onClick={(evt) => dispatch(actions[config.toggleAction](evt, config.type))}>
              <Icon className='icon' name='undo' />
              Go back
            </Button>
            <Button color='primary' onClick={(evt) => dispatch(actions[config.button.action](evt))}>
              <Icon className='icon' name={config.button.icon} />
              {config.button.label}
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>;
  }
}

ConfirmationModal.propTypes = {
  config: PropTypes.object,
  identifier: PropTypes.string,
  dispatch: PropTypes.func,
  actions: PropTypes.objectOf(PropTypes.func)
};
