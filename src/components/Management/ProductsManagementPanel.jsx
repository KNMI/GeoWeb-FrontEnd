import React from 'react';
import { Card, Button, CardTitle, CardText, Row } from 'reactstrap';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class ProductsManagementPanel extends React.Component {
  render () {
    const linkBase = 'manage/products/';
    const items = [
      {
        title: 'Bijvoet',
        text: 'Configuratie voor het Bijvoet-diagram',
        link: linkBase + 'progtemp'
      }, {
        title: 'SIGMET',
        text: 'Configuratie voor SIGMET',
        link: linkBase + 'sigmet'
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
                  <Button>Bewerk</Button>
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
