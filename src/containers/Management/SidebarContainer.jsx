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
        disabled: false,
        key: 'manage_applications'
      }, {
        title: 'Manage work schedule',
        icon: 'calendar',
        disabled: true,
        link: 'schedule',
        key: 'manage_work_schedule'
      }, {
        title: 'Product configuration',
        icon: 'thermometer-quarter',
        link: 'products',
        disabled: false,
        key: 'product_configuration'
      }, {
        title: 'Trigger configuration',
        icon: 'bell-o',
        disabled: false,
        link: 'monitoring_and_triggers',
        key: 'trigger_configuration'
      }, {
        title: 'Logging & Analysis',
        icon: 'meh-o',
        disabled: true,
        link: 'log',
        key: 'logging_analysis'
      }
    ];

    return (
      <Panel className='ManageSideContainer'>
        {items.map((item, i) => {
          return item.disabled
          ? <Button key={i} color='primary' className='row' title={item.title} disabled><Icon name={item.icon} /></Button>
          : <Link to={'manage/' + item.link} key={item.key} style={{ color: 'inherit', marginBottom: '0.33rem' }} >
            <Button key={i} color='primary' className='row' title={item.title} disabled={item.disabled === true} style={{ width: '3rem' }}>
              <Icon name={item.icon} />
            </Button>
          </Link>;
        })
      }
      </Panel>);
  }
}
