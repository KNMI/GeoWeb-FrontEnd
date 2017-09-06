import React from 'react';
import { Card, Button, CardTitle, CardText, Row } from 'reactstrap';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class ProductsManagementPanel extends React.Component {
  render () {
    const linkBase = 'manage/products/';
    const items = [
      {
        title: 'Progtemp',
        text: 'Configuration of the Progtemp-graph',
        link: linkBase + 'progtemp'
      }, {
        title: 'SIGMET',
        text: 'Configuration of the SIGMET',
        link: linkBase + 'sigmet'
      }, {
        title: 'TAF',
        text: 'Configuration of the TAF',
        link: linkBase + 'taf'
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
                    <Button>Edit</Button>
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
