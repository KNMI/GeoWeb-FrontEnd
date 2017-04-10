import Panel from '../Panel';
import React from 'react';
const Slider = require('rc-slider');
import { Row } from 'reactstrap';
export default class ManagementPanel extends React.Component {
  render () {
    const marks = {
      '-10': '-10°C',
      0: <strong>0°C</strong>,
      26: '26°C',
      37: '37°C',
      50: '50°C',
      100: {
        style: {
          color: 'red',
        },
        label: <strong>100°C</strong>,
      },
    };

    function log(value) {
      console.log(value); //eslint-disable-line
    }

    return (
      <Panel>
        <Row style={{ flex: 1 }}>
          <Slider.Range vertical min={-10} marks={marks} step={10}
            onChange={log} defaultValue={[20, 40]}
          />
        </Row>
      </Panel>
    );
  }
}
