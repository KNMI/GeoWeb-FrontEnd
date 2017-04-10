import React from 'react';
import Panel from '../../components/Panel';
import { Icon } from 'react-fa';
import { Button } from 'reactstrap';
import { Link } from 'react-router';
export default class SidebarContainer extends React.Component {
  render () {
    const items = [
      {
        title: 'Manage application',
        icon: 'cog',
        link: 'app',
        disabled: false
      }, {
        title: 'Manage work schedule',
        icon: 'calendar',
        disabled: true,
        link: 'schedule'
      }, {
        title: 'Product configuration',
        icon: 'thermometer-quarter',
        link: 'products',
        disabled: false
      }, {
        title: 'Trigger configuration',
        icon: 'bell-o',
        disabled: true,
        link: 'trigger'
      }, {
        title: 'Logging & Analysis',
        icon: 'meh-o',
        disabled: true,
        link: 'log'
      }
    ];

    return (
      <Panel className='ManageSideContainer'>
        {items.map((item, i) => {
          return item.disabled
          ? <Button key={i} color='primary' className='row' title={item.title} disabled><Icon name={item.icon} /></Button>
          : <Link to={'manage/' + item.link} style={{ color: 'inherit', marginBottom: '0.33rem' }} >
            <Button key={i} color='primary' className='row' title={item.title} disabled={item.disabled === true} style={{ width: '3rem' }}>
              <Icon name={item.icon} />
            </Button>
          </Link>;
        })
      }
      </Panel>);
  }
}
