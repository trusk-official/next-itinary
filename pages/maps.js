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
    itinerary: null
  };

  componentDidCatch(error) {
    /* eslint-disable no-console */
    console.error('Error initializing map', error);
    /* eslint-enable */
  }

  componentWillMount() {
    const { url: { query: { addresses, itinerary } } } = this.props;
    if (addresses && typeof addresses === 'string') {
      this.setState({ addresses: addresses.split(',') });
    }
    if (itinerary && typeof itinerary === 'string') {
      this.setState({ itinerary });
    }
  }

  showResults = () => {
    // ...
  };

  render() {
    const { addresses, itinerary } = this.state;
    return (
      <Fragment>
        <GoogleScriptProvider>
          <Flex>
            <MapsForm
              initialAddresses={addresses}
              initialItinerary={itinerary}
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
  initialItinerary: PropTypes.string
};

export default Maps;
