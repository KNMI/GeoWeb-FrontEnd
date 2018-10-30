import Panel from '../Panel';
import React from 'react';
import { Row, Card, CardTitle, CardText, Button } from 'reactstrap';
import { Link } from 'react-router';
export default class ManagementPanel extends React.Component {
  render () {
    const linkBase = 'manage/';
    const items = [
      {
        title: 'Application',
        text: 'Configuration of the GeoWeb application',
        link: linkBase + 'app'
      }, {
        title: 'Products',
        text: 'Configuration of several products',
        link: linkBase + 'products'
      }, {
        title: 'Triggers',
        text: 'Configuration of triggers',
        link: linkBase + 'triggers'
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
