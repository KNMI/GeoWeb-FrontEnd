import React from 'react';
import { Card, Button, ButtonGroup, Row, Col, Input, Alert } from 'reactstrap';
import Panel from '../Panel';
import axios from 'axios';
import JSONTree from 'react-json-tree';
import cloneDeep from 'lodash.clonedeep';

export default class TafExampleTafManagementPanel extends React.Component {
  constructor () {
    super();
    this.addTAF = this.addTAF.bind(this);
    this.toggleTAFValid = this.toggleTAFValid.bind(this);
    this.doneEditing = this.doneEditing.bind(this);
    this.editTAF = this.editTAF.bind(this);
    this.setTAF = this.setTAF.bind(this);
    this.setTAFValid = this.setTAFValid.bind(this);
    this.fetchTAFs = this.fetchTAFs.bind(this);
    this.testTAFs = this.testTAFs.bind(this);
    this.state = {
      tafsAndMessages: []
    };
  }

  fetchTAFs () {
    axios.get(this.props.urls.BACKEND_SERVER_URL + '/admin/example_tafs').then((r) => {
      const fetchedTAFs = [];
      r.data.payload.forEach((tafStr) => fetchedTAFs.push(JSON.parse(tafStr)));
      this.setState({ tafsAndMessages: cloneDeep(fetchedTAFs), onServer: cloneDeep(fetchedTAFs) });
    });
  }

  testTAFs () {
    var niceList = function (array, join, finalJoin) {
      var arr = array.slice(0);
      var last = arr.pop();
      join = join || ', ';
      finalJoin = finalJoin || ' and ';
      return arr.join(join) + finalJoin + last;
    };

    const results = [];
    let promiseArray = this.state.tafsAndMessages.map(taf =>
      axios({
        method: 'post',
        url: this.props.urls.BACKEND_SERVER_URL + '/tafs/verify',
        data: taf.taf
      })
    );

    // Test every taf
    axios.all(promiseArray).then(tafs => {
      // For each taf, the success depends whether the taf is marked as invalid
      tafs.forEach((taf, i) => {
        results.push(taf.data.succeeded !== this.state.tafsAndMessages[i].invalid);
      });

      // If it is all consistent we're good
      const allTrue = results.every((a) => a);
      if (allTrue) {
        console.warn('All TAFs validate as expected');
      } else {
        const cleanedIndices = results.map((e, i) => { if (e === false) return i; }).filter((a) => a !== undefined);
        if (cleanedIndices.length === 1) {
          console.warn('TAF ' + cleanedIndices[0] + ' does not validate as expected with the current schema');
        } else {
          console.warn('TAF ' + niceList(cleanedIndices) + ' do not validate as expected with the current schema');
        }
      }
    });
  }

  componentDidMount () {
    this.fetchTAFs();
  }

  addTAF () {
    const tafsCpy = this.state.tafsAndMessages.slice();
    tafsCpy.push({ edit: true });
    this.setState({ tafsAndMessages: tafsCpy });
  }

  toggleTAFValid (i) {
    const tafsCpy = this.state.tafsAndMessages.slice();
    const taf = tafsCpy[i];
    if (taf.invalid === true) {
      taf.invalid = false;
    } else {
      taf.invalid = true;
    }
    this.setState({ tafsAndMessages: tafsCpy });
  }

  doneEditing (i) {
    const tafsCpy = this.state.tafsAndMessages.slice();
    tafsCpy[i].edit = false;
    let url = this.props.urls.BACKEND_SERVER_URL + '/admin/example_tafs';
    // If there are more tafs in the frontend than on the backend post it,
    // otherwise update the existing taf
    // TODO: better mechanism for this
    if (i < this.state.onServer.length) {
      url = url + '/' + i;
    }
    axios({
      method: 'post',
      url: url,
      data: tafsCpy[i]
    }).then(() => this.fetchTAFs());
    ;
  }

  editTAF (i) {
    const tafsCpy = this.state.tafsAndMessages.slice();
    tafsCpy[i].edit = true;
    this.setState({ tafsAndMessages: tafsCpy });
  }
  deleteTAF (i) {
    let url = this.props.urls.BACKEND_SERVER_URL + '/admin/example_tafs/' + i;
    axios({
      method: 'delete',
      url: url
    }).then(() => this.fetchTAFs());
    ;
  }
  setTAF (i, text) {
    const tafsCpy = this.state.tafsAndMessages.slice();
    tafsCpy[i].taf = JSON.parse(text);
    this.setState({ tafsAndMessages: tafsCpy });
  }
  setTAFValid (i, isValid) {
    const tafsCpy = this.state.tafsAndMessages.slice();
    tafsCpy[i].invalid = !isValid;
    this.setState({ tafsAndMessages: tafsCpy });
  }
  render () {
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

    return (
      <Panel className='TafExampleManagementPanel'>
        <Col style={{ flexDirection: 'column' }}>
          <Row style={{ marginBottom: '0.5rem' }}>
            <Button color='primary' style={{ marginRight: '0.5rem' }} onClick={this.testTAFs}>Test current rules</Button>
            <Button color='primary' onClick={this.addTAF}>Add example TAF</Button>
          </Row>
          <Row>
            {this.state.tafsAndMessages.map((taf, i) => {
              return taf.edit
                ? <Card style={{ padding: '0.25rem' }} key={i}>
                  <Input type='textarea' placeholder='JSON structure of taf' rows='10' cols='50' onChange={evt => this.setTAF(i, evt.target.value)}>
                    {taf.taf ? JSON.stringify(taf.taf) : null}
                  </Input>
                  <Row>
                    <ButtonGroup>
                      <Button style={{ marginRight: '0.5rem' }} color='primary' onClick={() => this.doneEditing(i)}>Save example TAF</Button>
                      <Button color='success' onClick={() => this.setTAFValid(i, true)} active={!taf.invalid}>TAF is valid</Button>
                      <Button color='danger' onClick={() => this.setTAFValid(i, false)} active={taf.invalid}>TAF is invalid</Button>
                    </ButtonGroup>
                  </Row>
                </Card>
                : <Card style={{ padding: '0.25rem' }} key={i}>
                  <JSONTree data={taf.taf} theme={brewer} />
                  <Row>
                    <Button style={{ marginRight: '0.5rem' }} color='primary' onClick={() => this.editTAF(i)}>Edit TAF</Button>
                    <Button style={{ marginRight: '0.5rem' }} color='danger' onClick={() => this.deleteTAF(i)}>Delete TAF</Button>
                    {!taf.invalid ? <Alert color='success'>TAF {i} is valid</Alert> : <Alert color='danger'>TAF {i} is not valid</Alert>}
                  </Row>
                </Card>;
            })}
          </Row>
        </Col>
      </Panel>
    );
  }
}
