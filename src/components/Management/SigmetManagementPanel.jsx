import React from 'react';
import { Card, Button, CardTitle, CardText, Row } from 'reactstrap';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class SigmetManagementPanel extends React.Component {
  render () {
    const linkBase = 'manage/products/sigmet/';
    const items = [
      {
        title: 'Parameters',
        text: 'Configuratie van verscheidene parameters',
        link: linkBase + 'parameters'
      }, {
        title: 'Fenomenen',
        text: 'Configuratie voor SIGMET fenomenen',
        link: linkBase + 'phenomena',
        disabled: true
      }, {
        title: 'Lagen',
        text: 'Standaardlagen voor fenomenen',
        link: linkBase + 'layers',
        disabled: true
      }
    ];

    return (
      <Panel>
        <Row className='managementRow'>
          {
            items.map((item, i) => {
              return (
                <Card className='col-auto loc-card' block key={i}>
                  <CardTitle>{item.title}</CardTitle>
                  <CardText>{item.text}</CardText>
                  <Link to={item.link} className='row'>
                    <Button disabled={item.disabled === true}>Bewerk</Button>
                  </Link>
                </Card>
              );
            })
          }
        </Row>
      </Panel>
    );
  }
}
