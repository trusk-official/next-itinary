import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'rebass';

// Containers
import MapsContainer from '../containers/Maps';
import MapsForm from '../containers/MapsForm';

// Components
import GoogleScriptProvider from '../components/GoogleScriptProvider';

// Styles
import './styles/MapsStyles';

class Maps extends Component {
  state = {
    addresses: [],
    itinary: null
  };

  componentDidCatch(error) {
    /* eslint-disable no-console */
    console.error('Error initializing map', error);
    /* eslint-enable */
  }

  componentWillMount() {
    const { url: { query: { addresses, itinary } } } = this.props;
    if (addresses && typeof addresses === 'string') {
      this.setState({ addresses: addresses.split(',') });
    }
    if (itinary && typeof itinary === 'string') {
      this.setState({ itinary });
    }
  }

  showResults = () => {
    // ...
  };

  render() {
    const { addresses, itinary } = this.state;
    return (
      <Fragment>
        <GoogleScriptProvider>
          <Flex>
            <MapsForm
              initialAddresses={addresses}
              initialItinary={itinary}
              onSubmit={this.showResults}
            />
            <MapsContainer />
          </Flex>
        </GoogleScriptProvider>
      </Fragment>
    );
  }
}

Maps.propTypes = {
  url: PropTypes.object,
  initialItinary: PropTypes.string
};

export default Maps;
