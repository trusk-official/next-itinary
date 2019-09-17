import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { change, getFormValues, Field, reduxForm, untouch } from 'redux-form';
import Input from '../components/Input';

import {
  Close,
  Container,
  Heading,
  Flex,
  Group,
  Relative,
  Subhead,
  Text
} from 'rebass';

// Theme
import Colors from '../theme/Colors';

// Components
import AutoCompleteInput from '../components/AutoCompleteInput';
import DraggableList from '../components/DraggableList';
import Drawer from '../components/Drawer';
import Page from '../components/Page';
import DropDown from '../components/DropDown';

import ButtonOutlineWithCustomStyles from '../components/styled/ButtonOutlineWithCustomStyles';
import ButtonWithCustomStyles from '../components/styled/ButtonWithCustomStyles';

// Redux
import {
  addAddressStep,
  addPlace,
  getAddressSteps,
  getAddressStepsOrders,
  getInitError,
  getOptimizedError,
  getFetching,
  getFetchingOptimize,
  initForm,
  isFormValid,
  optimizeItinerary,
  removePlace,
  updatePlacesOrder,
  addItineraryRequest,
  deleteItineraryRequest,
  updateItineraryRequest,
  fetchItineraryRequest,
  fetchItineraryMapRequest,
  getPlaces,
  getItineraries,
  resetForm
} from '../redux/maps';

const REQUIRED_FIELDS_COUNT = 2;

class MapsForm extends Component {
  state = {
    formError: undefined,
    itineraryName: '',
    pickItineraryId: 'default',
    pickItineraryIndex: null,
    pickItinerary: null,
    isEdited: false
  };

  attemptOptimize = false;
  hasInitUrlItinerary = false;

  componentWillMount() {
    const { initialAddresses, initForm, fetchItineraryRequest } = this.props;
    initForm(initialAddresses, REQUIRED_FIELDS_COUNT);
    fetchItineraryRequest();
  }

  componentWillReceiveProps({ itineraries, fetchingOptimize }) {
    const { initialItinerary, fetchItineraryMapRequest } = this.props;
    if (this.attemptOptimize && !fetchingOptimize) {
      this.props.reset();
      this.attemptOptimize = false;
    }
    let foundItem = itineraries.find(function(element) {
      let objFound;
      if (element.id == initialItinerary) {
        objFound = element;
      }
      return objFound;
    });
    if (foundItem && !this.hasInitUrlItinerary) {
      this.hasInitUrlItinerary = true;
      fetchItineraryMapRequest(foundItem);
      this.setState({ isEdited: true, itineraryName: foundItem.label });
    }
  }

  addItineraryStep = () => {
    const { addAddressStep, isFormValid } = this.props;

    if (!isFormValid) {
      this.setState({
        formError: 'You must fill all fields before adding new step.'
      });
    } else {
      const { addressSteps } = this.props;
      const lastNum = addressSteps.length - 1;
      addAddressStep({
        required: false,
        stepNum: lastNum + 1,
        id: Date.now().toString()
      });
    }
  };

  removeStep = adrId => {
    const { addressSteps, dispatch } = this.props;
    const removedAddressStep = addressSteps.find(adr => adr.id === adrId);
    if (removedAddressStep) {
      const inputName = `adr_${adrId}`;
      dispatch(change('mapsForm', inputName, ''));
      dispatch(untouch('mapsForm', inputName));
      this.onPlaceRemove(removedAddressStep.id, true);
    }
  };

  onPlaceComplete = place => {
    const { addPlace } = this.props;
    this.removeFormErrors();
    addPlace(place);
  };

  onPlaceRemove = (placeInputId, removeInput = false) => {
    const { removePlace } = this.props;
    this.removeFormErrors();
    removePlace(placeInputId, removeInput);
  };

  buildInputs = addressSteps => {
    const { places } = this.props;
    return addressSteps.map(adr => {
      const matchPlace = places.find(({inputId: pInputId}) => pInputId === adr.id);
      return (
          <Flex
              alignItems="center"
              key={`adr_children_${adr.id}`}
              order={adr.stepNum}
          >
            <Flex flex={7}>
              <Field
                  key={`adr_${adr.id}`}
                  id={adr.id}
                  name={`adr_${adr.id}`}
                  component={AutoCompleteInput}
                  formError={this.state.formError}
                  initialValue={matchPlace && matchPlace.address}
                  onPlaceComplete={this.onPlaceComplete}
                  onPlaceRemove={this.onPlaceRemove}
                  type="text"
                  required={adr.required}
                  stepNum={adr.stepNum}
                  placeholder={this.getInputPlaceholder(adr.stepNum)}
              />
            </Flex>
            {!adr.required && (
                <Flex flex={1} mt={2}>
                  <Close fontSize={25} onClick={() => this.removeStep(adr.id)}/>
                </Flex>
            )}
          </Flex>
      );
    });
  };

  getInputPlaceholder(stepNum) {
    switch (stepNum) {
      case 0:
        return 'Starting address';
      case 1:
        return 'Ending address';
      default:
        return `Step ${stepNum - 1}`;
    }
  }

  optimizeItinerary = () => {
    const { isFormValid, formValues, optimizeItinerary } = this.props;

    if (!isFormValid) {
      this.setState({
        formError: 'You must fill all fields before optimize your itinerary.'
      });
    } else if (Object.keys(formValues).length <= 3) {
      this.setState({
        formError: 'You must have fill at least 2 steps for optimizing routes.'
      });
    } else {
      this.attemptOptimize = true;
      this.removeFormErrors();
      optimizeItinerary(REQUIRED_FIELDS_COUNT);
    }
  };

  updateInputOrders = addressStepsOrders => {
    const { addressSteps, updatePlacesOrder } = this.props;
    updatePlacesOrder(addressSteps, addressStepsOrders, REQUIRED_FIELDS_COUNT);
  };

  removeFormErrors = () => {
    this.setState({ formError: undefined });
  };

  saveItinerary = () => {
    const { addItineraryRequest, places } = this.props;
    const { itineraryName } = this.state;
    if (places.length >= 2 && itineraryName) {
      addItineraryRequest(places, itineraryName);
      this.setState({
        isEdited: true,
        isNewItinerary: false,
        formError: undefined
      });
    } else {
      alert('Please fill all addresses and a name for save the itinerary');
    }
  };

  deleteItinerary = () => {
    const { deleteItineraryRequest } = this.props;
    const { pickItineraryId, pickItineraryIndex } = this.state;
    deleteItineraryRequest(pickItineraryId, pickItineraryIndex);
    this.setState({
      pickItinerary: null,
      itineraryName: null,
      pickItineraryIndex: null,
      isEdited: false,
      isNewItinerary: false
    });
  };

  updateItinerary = () => {
    const { updateItineraryRequest, places } = this.props;
    const { pickItineraryId, pickItineraryIndex, itineraryName } = this.state;
    let placesArray = [];
    places.map(place => {
      placesArray.push(place.id);
    });
    const updateData = { label: itineraryName, place_ids: placesArray };
    updateItineraryRequest(pickItineraryId, updateData, pickItineraryIndex);
    this.setState({ formError: undefined });
  };

  isEditedItinerary = () => {
    const { isEdited } = this.state;
    this.setState({ isEdited: !isEdited, isNewItinerary: false });
    this.props.addressSteps;
  };

  handleNameNewItinerary = itineraryName => {
    this.setState({ itineraryName });
  };

  handleChangeDropDown = (index, obj) => {
    const { fetchItineraryMapRequest, resetForm } = this.props;
    resetForm();
    this.setState({
      pickItineraryId: obj && obj.id,
      pickItineraryIndex: index,
      pickItinerary: obj,
      itineraryName: obj && obj.label,
      isEdited: false,
      isNewItinerary: false,
      formError: undefined
    });
    if (obj) {
      fetchItineraryMapRequest(obj);
    }
  };

  isNewItinerary = () => {
    const { resetForm, reset } = this.props;
    this.setState({
      isNewItinerary: true,
      isEdited: false,
      itineraryName: '',
      pickItineraryIndex: null,
      pickItinerary: null,
      formError: undefined
    });
    reset();
    resetForm();
  };

  render() {
    const {
      addressSteps,
      initFormError,
      fetchingInit,
      fetchingOptimize,
      handleSubmit,
      optimizedFormError,
      itineraries
    } = this.props;
    const {
      formError,
      itineraryName,
      pickItineraryId,
      isEdited,
      pickItinerary,
      isNewItinerary
    } = this.state;
    return (
      <Fragment>
        <Drawer>
          <Heading
            bg={Colors.primary}
            color="white"
            mb={20}
            p={20}
            textAlign={'center'}
          >
            React / Redux itinerary :
          </Heading>
          <Container>
            {fetchingInit || fetchingOptimize ? (
              <p> Loading... </p>
            ) : initFormError ? (
              <p>
                Error initializing form : <br />
                {initFormError}
              </p>
            ) : (
              <Fragment>
                <DropDown
                  onChange={this.handleChangeDropDown}
                  listItineraries={itineraries}
                  pickItineraryId={pickItineraryId}
                />
                <Flex mt={2}>
                  <ButtonWithCustomStyles
                    bg={Colors.primary}
                    width={1 / 2}
                    onClick={this.isNewItinerary}
                  >
                    <Text>New Itinerary</Text>
                  </ButtonWithCustomStyles>
                </Flex>
                {(pickItinerary || isEdited) && (
                  <Fragment>
                    <Subhead mt={2}>
                      <ButtonWithCustomStyles
                        bg={Colors.primary}
                        width={1 / 2}
                        onClick={this.isEditedItinerary}
                      >
                        <Text>Editer</Text>
                      </ButtonWithCustomStyles>
                    </Subhead>
                    <Subhead mt={2}>
                      <ButtonWithCustomStyles
                        bg={Colors.primary}
                        width={1 / 2}
                        onClick={this.deleteItinerary}
                      >
                        <Text>Supprimer</Text>
                      </ButtonWithCustomStyles>
                    </Subhead>
                  </Fragment>
                )}
                {(isEdited || isNewItinerary) && (
                  <Fragment>
                    <Subhead mt={4} fontSize={3} mb={15}>
                      Your itinerary :
                    </Subhead>
                    <Subhead mb={15}>
                      <Text color={Colors.secondary} fontSize={1}>
                        You can reorder inputs by dragging the labels.
                      </Text>
                    </Subhead>
                    <Flex mb={10} mr={30}>
                      <Input
                        forceError={formError}
                        id="1"
                        isValid={true}
                        input={{
                          onChange: this.handleNameNewItinerary,
                          value: itineraryName
                        }}
                        meta={{}}
                        placeholder="Itinerary name"
                        required={false}
                        saveButton={isEdited ? false : this.saveItinerary}
                        onSave={this.saveItinerary}
                        isEdited={isEdited}
                      />
                    </Flex>
                    <form onSubmit={handleSubmit}>
                      <Relative>
                        <DraggableList
                          draggableHeight={'30px'}
                          draggableWidth={'100%'}
                          updateOrders={this.updateInputOrders}
                        >
                          {this.buildInputs(addressSteps)}
                        </DraggableList>
                      </Relative>
                      {(formError || optimizedFormError) && (
                        <Text color={Colors.error}>
                          {formError || optimizedFormError}
                        </Text>
                      )}
                    </form>
                    {isEdited && (
                      <Fragment>
                        <Flex justifyContent="center" mt={4} mb={30} mr={30}>
                          <ButtonOutlineWithCustomStyles
                            color="#8BC34A"
                            width={1 / 2}
                            onClick={this.updateItinerary}
                          >
                            <Text>Save</Text>
                          </ButtonOutlineWithCustomStyles>
                        </Flex>
                      </Fragment>
                    )}

                    <Flex justifyContent="center" mt={5} mb={30} mr={30}>
                      <Group>
                        <ButtonOutlineWithCustomStyles
                          color={Colors.primary}
                          width={1 / 2}
                          onClick={this.addItineraryStep}
                        >
                          <Text>Add step</Text>
                        </ButtonOutlineWithCustomStyles>
                        <ButtonWithCustomStyles
                          bg={Colors.primary}
                          width={1 / 2}
                          onClick={this.optimizeItinerary}
                        >
                          <Text>Optimize</Text>
                        </ButtonWithCustomStyles>
                      </Group>
                    </Flex>
                  </Fragment>
                )}

                <Subhead mb={30}>
                  <Text color={Colors.secondary} fontSize={1}>
                    See the Github repository{' '}
                    <a
                      href="https://github.com/nbdn/next-redux-itinerary"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      here
                    </a>.
                  </Text>
                </Subhead>
              </Fragment>
            )}
          </Container>
        </Drawer>
      </Fragment>
    );
  }
}

MapsForm.propTypes = {
  addAddressStep: PropTypes.func,
  addPlace: PropTypes.func,
  addressSteps: PropTypes.array,
  dispatch: PropTypes.func,
  fetchingInit: PropTypes.bool,
  fetchingOptimize: PropTypes.bool,
  formValues: PropTypes.object,
  handleSubmit: PropTypes.func,
  initialAddresses: PropTypes.array,
  initForm: PropTypes.func,
  initFormError: PropTypes.string,
  isFormValid: PropTypes.bool,
  optimizeItinerary: PropTypes.func,
  optimizedFormError: PropTypes.string,
  removePlace: PropTypes.func,
  reset: PropTypes.func,
  updatePlacesOrder: PropTypes.func,
  addItineraryRequest: PropTypes.func,
  deleteItineraryRequest: PropTypes.func,
  updateItineraryRequest: PropTypes.func,
  fetchItineraryRequest: PropTypes.func,
  fetchItineraryMapRequest: PropTypes.func,
  places: PropTypes.array,
  itineraries: PropTypes.array,
  resetForm: PropTypes.func,
  initialItinerary: PropTypes.string
};

MapsForm.defaultProps = {
  itineraries: []
};

const mapStateToProps = state => {
  return {
    addressSteps: getAddressSteps(state),
    getAddressStepsOrders: getAddressStepsOrders(state),
    initFormError: getInitError(state),
    isFormValid: isFormValid(state),
    optimizedFormError: getOptimizedError(state),
    fetchingInit: getFetching(state),
    fetchingOptimize: getFetchingOptimize(state),
    formValues: getFormValues('mapsForm')(state),
    places: getPlaces(state),
    itineraries: getItineraries(state)
  };
};

const mapDispatchToProps = {
  addAddressStep,
  addPlace,
  initForm,
  optimizeItinerary,
  removePlace,
  updatePlacesOrder,
  addItineraryRequest,
  deleteItineraryRequest,
  updateItineraryRequest,
  fetchItineraryRequest,
  fetchItineraryMapRequest,
  resetForm
};

/* eslint-disable no-class-assign */
MapsForm = connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'mapsForm',
    destroyOnUnmount: true
  })(MapsForm)
);
/* eslint-enable */

export default Page(MapsForm);
