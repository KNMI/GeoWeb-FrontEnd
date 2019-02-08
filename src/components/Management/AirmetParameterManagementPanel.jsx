import React from 'react';
import Panel from '../Panel';
import { Input, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import { Icon } from 'react-fa';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';

export default class AirmetParameterManagementPanel extends React.Component {
  componentWillMount () {
    axios.get(this.props.urls.BACKEND_SERVER_URL + '/sigmets/getsigmetparameters').then((res) => {
      this.airmetParameters = res.data;
      this.setState({ airmetParameters: this.airmetParameters });
    }).catch((e) => console.error('Fetching parameters failed: ', e));
  }
  /* istanbul ignore next */
  render () {
    if (!this.airmetParameters) {
      return <Panel className='AirmetParameterManagementPanel' />;
    } else {
      return (
        <ParameterMapper airmetParameters={this.state.airmetParameters} />
      );
    }
  }
}

export class ParameterMapper extends React.Component {
  /* istanbul ignore next */
  constructor () {
    super();
    this.setEditMode = this.setEditMode.bind(this);
    this.deleteFirArea = this.deleteFirArea.bind(this);
    this.addFirLocation = this.addFirLocation.bind(this);
    this.saveAirmetParameters = this.saveAirmetParameters.bind(this);
    this.state = {
      airmetParameters: {}
    };
  }

  /* istanbul ignore next */
  saveAirmetParameters () {
    const maxhoursofvalidity = parseInt(document.querySelector('#maxhoursofvalidity').value);
    const hoursbeforevalidity = parseInt(document.querySelector('#hoursbeforevalidity').value);
    const locationIndicatorWmo = document.querySelector('#location_indicator_wmo').value;
    let firs = [];
    for (var i = 0; i < this.state.airmetParameters.firareas.length; ++i) {
      firs.push({
        firnameinput: document.querySelector('#firnameinput' + i).value,
        areapresetinput: document.querySelector('#areapresetinput' + i).value,
        icaoinput: document.querySelector('#icaoinput' + i).value
      });
    }

    const newAirmetParameterObj = {
      maxhoursofvalidity: maxhoursofvalidity,
      hoursbeforevalidity: hoursbeforevalidity,
      location_indicator_wmo: locationIndicatorWmo,
      firareas: firs
    };

    axios.post('/savelocations', newAirmetParameterObj);
  }
  deleteFirArea (i) {
    let arrayCpy = cloneDeep(this.state.airmetParameters);
    arrayCpy.firareas.splice(i, 1);
    this.setState({ airmetParameters: arrayCpy });
  }
  addFirLocation () {
    let arrayCpy = cloneDeep(this.state.airmetParameters);
    arrayCpy.firareas.push({ });
    this.setState({ airmetParameters: arrayCpy });
  }

  setEditMode (i) {
    let arrayCpy = this.state.airmetParameters.map((a) => Object.assign(a));
    arrayCpy[i].edit = true;
    this.setState({ airmetParameters: arrayCpy });
  }
  componentWillMount () {
    this.setState({ airmetParameters: this.props.airmetParameters });
  }
  componentWillReceiveProps (nextprops) {
    this.setState({ airmetParameters: nextprops.airmetParameters });
  }
  render () {
    return (
      <Panel className='AirmetParameterManagementPanel'>
        <Row style={{ flex: 1, maxHeight: '15rem' }}>
          {['maxhoursofvalidity', 'hoursbeforevalidity', 'location_indicator_wmo'].map((p, i) =>
            <AirmetCard key={i} i={i} title={p} value={this.state.airmetParameters[p] ? this.state.airmetParameters[p].toString() : ''} />
          )}
        </Row>
        <Row style={{ flex: 1 }}>
          <Row><h2>FIR areas</h2></Row>
          <Row style={{ flex: 1 }}>
            {this.state.airmetParameters.firareas.map((fir, i) =>
              <AirmetCard key={i} i={i} fir title={fir.firname} firdata={fir} deleteFirArea={this.deleteFirArea} />
            )}
          </Row>
        </Row>
        <Row style={{ bottom: '1rem', position: 'fixed' }}>
          <Col>
            <Button color='primary' onClick={this.saveAirmetParameters} style={{ marginRight: '1rem' }}>Save</Button>
            <Button color='primary' onClick={this.addFirLocation}>Add</Button>
          </Col>
        </Row>
      </Panel>
    );
  }
}
ParameterMapper.propTypes = {
  airmetParameters: PropTypes.object.isRequired
};

class AirmetCard extends React.Component {
  render () {
    const { title, firdata, value, i, deleteFirArea, fir } = this.props;
    return (!fir
      ? <Col><ParameterCard i={i} title={title} value={value} /></Col>
      : <Col><FirCard i={i} title={title} areapreset={firdata.areapreset} icao={firdata.location_indicator_icao} deleteFirArea={deleteFirArea} /></Col>);
  }
}
AirmetCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
  firdata: PropTypes.object,
  i: PropTypes.number.isRequired,
  fir: PropTypes.bool,
  deleteFirArea: PropTypes.func
};

class ParameterCard extends React.Component {
  getTitle (p) {
    switch (p) {
      case 'maxhoursofvalidity':
        return 'Max. hours of validity';
      case 'hoursbeforevalidity':
        return 'Hours before validity';
      case 'location_indicator_wmo':
        return 'WMO Location Indicator';
      default:
        return p;
    }
  }

  render () {
    const { title, value, i } = this.props;
    return <Card className='col-auto loc-card' key={i}>
      <CardTitle>{this.getTitle(title)}</CardTitle>
      <CardText>
        <table style={{ display: 'table', width: '100%' }}>
          <tbody>
            <tr>
              <td><Input step='any' id={title} placeholder='value' defaultValue={value} required /></td>
            </tr>
          </tbody>
        </table>
      </CardText>
    </Card>;
  }
}
ParameterCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired
};

class FirCard extends React.Component {
  render () {
    const { i, title, areapreset, icao, deleteFirArea } = this.props;
    return <Card className='col-auto loc-card' key={i} style={{ minHeight: '13rem' }}>
      <CardTitle><Input id={'firnameinput' + i} placeholder='FIR name' defaultValue={title} required /></CardTitle>
      <CardText>
        <table style={{ display: 'table', width: '100%' }}>
          <tbody>
            <tr>
              <td>Area Preset</td>
              <td><Input id={'areapresetinput' + i} placeholder='Area preset' defaultValue={areapreset} required /></td>
            </tr>
            <tr>
              <td>ICAO name</td>
              <td><Input id={'icaoinput' + i} placeholder='ICAO name' defaultValue={icao} required /></td>
            </tr>
          </tbody>
        </table>
        <Icon name='times' onClick={() => deleteFirArea(i)} />
      </CardText>
    </Card>;
  }
}
FirCard.propTypes = {
  title: PropTypes.string,
  areapreset: PropTypes.string,
  icao: PropTypes.string,
  i: PropTypes.number.isRequired,
  deleteFirArea: PropTypes.func.isRequired
};
