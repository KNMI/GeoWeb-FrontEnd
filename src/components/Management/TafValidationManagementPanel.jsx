import React from 'react';
import Panel from '../Panel';
import { Row, Button } from 'reactstrap';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
// Can show compactly
import JSONTree from 'react-json-tree';
// Can edit but not compactly
import { JsonEditor } from 'react-json-edit';

export default class TafValidationManagementPanel extends React.Component {
  constructor () {
    super();
    this.state = {
      schema: null,
      tempSchema: null,
      edit: false
    };
    this.reset = this.reset.bind(this);
  }
  componentDidMount () {
    axios.get('http://localhost:8080/admin/validation/schema/taf').then((r) => this.setState({ schema: cloneDeep(r.data), tempSchema: cloneDeep(r.data) }));
  }
  reset () {
    axios.get('http://localhost:8080/admin/validation/schema/taf').then((r) => this.setState({ schema: cloneDeep(r.data) }));
  }
  render () {
    // TODO: ugly, consult WvM
    // TODO: When view is fully expanded, it should look proper
    const flexDir = this.state.edit ? 'row' : 'column';
    return (
      <Panel style={{ flexDirection: flexDir }}>
        <Row>
          { this.state.edit
            ? <Row>
              <Button color='primary' onClick={() => this.setState({ edit: false, tempSchema: this.state.schema })}>Discard and stop editing</Button>
              <Button color='primary' onClick={() => this.setState({ edit: false })}>Stop editing but keep changes</Button>
              <Button color='primary' onClick={() => this.setState({ edit: false, schema: this.state.tempSchema })}>Temporary Save Changes</Button>
            </Row>
            : <Row>
              <Button color='primary' onClick={this.reset}>Reset</Button>
              <Button color='primary' onClick={() => this.setState({ edit: true })}>Edit</Button>
              <Button color='primary' onClick={() => this.saveJsonSchema(this.state.schema)}>Save permanently</Button>
            </Row>
          }
        </Row>
        <Row className='managementRow'>
          {this.state.edit
            ? <JsonEditor value={this.state.tempSchema} propagateChanges={(newSchema) => this.setState({ tempSchema: newSchema })} />
            : <JSONTree data={this.state.schema} />
          }
        </Row>
      </Panel>
    );
  }
}
