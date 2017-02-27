import React, { Component, PropTypes } from 'react';
import { push as Menu } from 'react-burger-menu';

class DataSelector extends Component {
  showSettings (event) {
    event.preventDefault();
  }
  render () {
    const { title } = this.props;
    return (
      <Menu pageWrapId={'adagucWrapper'} outerContainerId='root' isOpen>
        <a id='home' className='menu-item' href='/'>Home</a>
        <a id='about' className='menu-item' href='/about'>About</a>
        <a id='contact' className='menu-item' href='/contact'>Contact</a>
      </Menu>

    );
    // return (
    //   <div className='wrapper'>
    //     <div className='row row-offcanvas row-offcanvas-left'>
    //       <div className='column col-sm-3 col-xs-1 sidebar-offcanvas' id='sidebar'>
    //         <ul className='nav' id='menu'>
    //           <li><a href='#'><i className='fa fa-list-alt' /> <span className='collapse in hidden-xs'>Link 1</span></a></li>
    //           <li><a href='#'><i className='fa fa-list' /> <span className='collapse in hidden-xs'>Stories</span></a></li>
    //           <li><a href='#'><i className='fa fa-paperclip' /> <span className='collapse in hidden-xs'>Saved</span></a></li>
    //           <li><a href='#'><i className='fa fa-refresh' /> <span className='collapse in hidden-xs'>Refresh</span></a></li>
    //           <li>
    //             <a href='#' data-target='#item1' data-toggle='collapse'><i className='fa fa-list' /> <span className='collapse in hidden-xs'>Menu <span className='caret' /></span></a>
    //             <ul className='nav nav-stacked collapse left-submenu' id='item1'>
    //               <li><a href='google.com'>View One</a></li>
    //               <li><a href='gmail.com'>View Two</a></li>
    //             </ul>
    //           </li>
    //           <li>
    //             <a href='#' data-target='#item2' data-toggle='collapse'><i className='fa fa-list' /> <span className='collapse in hidden-xs'>Menu <span className='caret' /></span></a>
    //             <ul className='nav nav-stacked collapse' id='item2'>
    //               <li><a href='#'>View One</a></li>
    //               <li><a href='#'>View Two</a></li>
    //               <li><a href='#'>View Three</a></li>
    //             </ul>
    //           </li>
    //           <li><a href='#'><i className='glyphicon glyphicon-list-alt' /> <span className='collapse in hidden-xs'>Link</span></a></li>
    //         </ul>
    //       </div>
    //       <div className='column col-sm-9 col-xs-11' id='main'>
    //         <p><a href='#' data-toggle='offcanvas'><i className='fa fa-navicon fa-2x' /></a></p>
    //         <p>
    //             Main content...
    //         </p>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}

DataSelector.propTypes = {
  adagucProperties: PropTypes.object.isRequired,
  menuItems: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};

export default DataSelector;
