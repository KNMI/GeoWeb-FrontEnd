import React, { PureComponent } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import styles from '../styles/confirmationmodal.scss';
import classNames from 'classnames/bind';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import RadioGroup from './Basis/RadioGroup';

const styleContext = classNames.bind(styles);

export default class ConfirmationModal extends PureComponent {
  render () {
    const { config, dispatch, actions, identifier } = this.props;
    const { options } = config.optional || {};
    const hasOptions = Array.isArray(options) && options.length > 0;
    return <Modal className={styleContext('ConfirmationModal')} isOpen toggle={(evt) => dispatch(actions[config.toggleAction](evt, null, config.type))}>
      <ModalHeader>{config.title}</ModalHeader>
      <ModalBody>
        <Row>
          <Col>{config.message(identifier)}</Col>
        </Row>
        {hasOptions && config.optional.message
          ? <Row>
            <Col>{config.optional.message}</Col>
          </Row>
          : null
        }
        {hasOptions
          ? <Row>
            <Col>
              <RadioGroup
                value={config.optional.selectedOption || ''}
                options={options}
                onChange={(evt, value) => dispatch(actions[config.optional.action](...config.optional.parameters, [value]))}
                data-field='confirmation'
                spacedEvenly
              />
            </Col>
            {hasOptions
              ? <Col xs='auto'>
                <button className='clear close' title={config.optional.selectedOption ? 'Clear' : null} disabled={!config.optional.selectedOption}
                  onClick={(evt) => dispatch(actions[config.optional.action](...config.optional.parameters, []))}><span>×</span></button>
              </Col>
              : null
            }
          </Row>
          : null
        }
      </ModalBody>
      <ModalFooter>
        <Row>
          <Col xs={{ offset: '4', size: '8' }}>
            <Button color='primary' onClick={(evt) => dispatch(actions[config.toggleAction](evt, null, config.type))}>
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
  config: PropTypes.object.isRequired,
  identifier: PropTypes.string,
  dispatch: PropTypes.func,
  actions: PropTypes.objectOf(PropTypes.func)
};
