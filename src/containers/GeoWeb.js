import React from 'react';
import ADAGUC from '../components/ADAGUC.js';
import Menu from '../components/Menu.js';
import { connect } from 'react-redux';

class GeoWeb extends React.Component {
  render () {
    const { store, adagucProperties } = this.props;
    // TODO: if menu is on top then the pointer location in the ADAGUC viewer is wrong
    return  <div>
              <div id='adaguc'>
                <ADAGUC store={store} adagucProperties={adagucProperties} id='map0'/>
              </div>
              <div id='menu'>
                <Menu store={store} />
              </div>
            </div>;
  }
}

GeoWeb.propTypes = {
  adagucProperties: React.PropTypes.object,
  store: React.PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
  return state.adaguc;
};

// ????
const mapDispatchToProps = (dispatch, ownProps) => {
  return { };
};
export default connect(mapStateToProps,
  mapDispatchToProps
)(GeoWeb);

