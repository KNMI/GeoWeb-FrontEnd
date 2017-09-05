import React from 'react';
import { Card, Button, CardTitle, CardText, Row } from 'reactstrap';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class TafManagementPanel extends React.Component {
  render () {
    const linkBase = 'manage/products/taf/';
    const items = [
      {
        title: 'Validatieregels',
        text: 'Configuratie van de validatieregels',
        link: linkBase + 'validation'
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
