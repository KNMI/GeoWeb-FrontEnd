import React from 'react';
import Panel from '../Panel';
import { Row, Col, Button } from 'reactstrap';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import JSONTree from 'react-json-tree';
import { JsonEditor } from 'react-json-edit';
import diff from 'deep-diff';

export default class TafValidationManagementPanel extends React.Component {
  constructor () {
    super();
    this.state = {
      schema: null,
      tempSchema: null,
      edit: false
    };
    this.reset = this.reset.bind(this);
    this.saveJsonSchema = this.saveJsonSchema.bind(this);
  }
  componentDidMount () {
    axios.get(this.props.urls.BACKEND_SERVER_URL + '/admin/validation/schema/taf').then((r) => this.setState({ schema: cloneDeep(r.data), tempSchema: cloneDeep(r.data) }));
  }
  reset () {
    this.setState({ tempSchema: cloneDeep(this.state.schema) });
  }
  saveJsonSchema (schema) {
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/admin/validation/schema/taf',
      data: schema
    }).then(() => console.log('done'));
  }
  render () {
    // Theme with light background
    // Taken from: https://github.com/gaearon/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes
    const brewer = {
      scheme: 'brewer',
      author: 'timothée poisot (http://github.com/tpoisot)',
      base00: '#0c0d0e',
      base01: '#2e2f30',
      base02: '#515253',
      base03: '#737475',
      base04: '#959697',
      base05: '#b7b8b9',
      base06: '#dadbdc',
      base07: '#fcfdfe',
      base08: '#e31a1c',
      base09: '#e6550d',
      base0A: '#dca060',
      base0B: '#31a354',
      base0C: '#80b1d3',
      base0D: '#3182bd',
      base0E: '#756bb1',
      base0F: '#b15928'
    };

    const hasChanges = !!diff(this.state.schema, this.state.tempSchema);
    return (
      <Panel>
        <Col style={{ flexDirection: 'column' }}>
          { this.state.edit
            ? <Row>
              <Button color='primary' onClick={() => this.setState({ edit: false })}>Exit edit mode</Button>
            </Row>
            : <Row>
              <Button color='primary' onClick={() => this.setState({ edit: true })}>Edit</Button>
              <Button disabled={!hasChanges} style={{ marginLeft: '.5rem' }} color='primary' onClick={this.reset}>Revert</Button>
              <Button disabled={!hasChanges} style={{ marginLeft: '.25rem' }} color='primary' onClick={() => this.saveJsonSchema(this.state.tempSchema)}>Save</Button>
            </Row>
          }
          <Row style={{ flex: 1 }}>
            <Col style={{ flex: 1, overflow: 'auto' }}>
              {this.state.edit
                ? <JsonEditor value={this.state.tempSchema} tableLike propagateChanges={(newSchema) => this.setState({ tempSchema: newSchema })} />
                : <JSONTree data={this.state.tempSchema} theme={brewer} />
              }
            </Col>
          </Row>
        </Col>
      </Panel>
    );
  }
}
