import React from 'react';
import { Card, Button, CardTitle, CardText, Row } from 'reactstrap';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class TafManagementPanel extends React.Component {
  render () {
    const linkBase = 'manage/products/taf/';
    const items = [
      {
        title: 'Configure TAF locations',
        text: 'Configuration of the locations at which a TAF can be issued',
        link: linkBase + 'locations'
      },
      {
        title: 'Validation rules',
        text: 'Configuration of the validation rules',
        link: linkBase + 'validation'
      },
      {
        title: 'Example TAFs',
        text: 'Test a schema against these TAFs to ensure correctness of the schema',
        link: linkBase + 'example_tafs'
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
                    <Button disabled={item.disabled === true}>Edit</Button>
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
