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
  optimizeItinary,
  removePlace,
  updatePlacesOrder,
  addItinaryRequest,
  deleteItinaryRequest,
  updateItinaryRequest,
  fetchItinaryRequest,
  fetchItinaryMapRequest,
  getPlaces,
  getItineraries,
  resetForm
} from '../redux/maps';

const REQUIRED_FIELDS_COUNT = 2;

class MapsForm extends Component {
  state = {
    formError: undefined,
    itinaryName: '',
    pickItinaryId: 'default',
    pickItinaryIndex: null,
    pickItinary: null,
    isEdited: false
  };

  attemptOptimize = false;
  hasInitUrlItinary = false;

  componentWillMount() {
    const { initialAddresses, initForm, fetchItinaryRequest } = this.props;
    initForm(initialAddresses, REQUIRED_FIELDS_COUNT);
    fetchItinaryRequest();
  }

  componentWillReceiveProps({ itineraries, fetchingOptimize }) {
    const { initialItinary, fetchItinaryMapRequest } = this.props;
    if (this.attemptOptimize && !fetchingOptimize) {
      this.props.reset();
      this.attemptOptimize = false;
    }
    let foundItem = itineraries.find(function(element) {
      let objFound;
      if (element.id == initialItinary) {
        objFound = element;
      }
      return objFound;
    });
    if (foundItem && !this.hasInitUrlItinary) {
      this.hasInitUrlItinary = true;
      fetchItinaryMapRequest(foundItem);
      this.setState({ isEdited: true, itinaryName: foundItem.label });
    }
  }

  addItinaryStep = () => {
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

  buildInputs = addressSteps =>
    addressSteps.map(adr => (
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
            initialValue={adr.initialValue}
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
            <Close fontSize={25} onClick={() => this.removeStep(adr.id)} />
          </Flex>
        )}
      </Flex>
    ));

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

  optimizeItinary = () => {
    const { isFormValid, formValues, optimizeItinary } = this.props;

    if (!isFormValid) {
      this.setState({
        formError: 'You must fill all fields before optimize your itinary.'
      });
    } else if (Object.keys(formValues).length <= 3) {
      this.setState({
        formError: 'You must have fill at least 2 steps for optimizing routes.'
      });
    } else {
      this.attemptOptimize = true;
      this.removeFormErrors();
      optimizeItinary(REQUIRED_FIELDS_COUNT);
    }
  };

  updateInputOrders = addressStepsOrders => {
    const { addressSteps, updatePlacesOrder } = this.props;
    updatePlacesOrder(addressSteps, addressStepsOrders, REQUIRED_FIELDS_COUNT);
  };

  removeFormErrors = () => {
    this.setState({ formError: undefined });
  };

  saveItinary = () => {
    const { addItinaryRequest, places } = this.props;
    const { itinaryName } = this.state;
    if (places.length >= 2 && itinaryName) {
      addItinaryRequest(places, itinaryName);
      this.setState({
        isEdited: true,
        isNewItinary: false,
        formError: undefined
      });
    } else {
      alert('Please fill all addresses and a name for save the itinerary');
    }
  };

  deleteItinary = () => {
    const { deleteItinaryRequest } = this.props;
    const { pickItinaryId, pickItinaryIndex } = this.state;
    deleteItinaryRequest(pickItinaryId, pickItinaryIndex);
    this.setState({
      pickItinary: null,
      itinaryName: null,
      pickItinaryIndex: null,
      isEdited: false,
      isNewItinary: false
    });
  };

  updateItinary = () => {
    const { updateItinaryRequest, places } = this.props;
    const { pickItinaryId, pickItinaryIndex, itinaryName } = this.state;
    let placesArray = [];
    places.map(place => {
      placesArray.push(place.id);
    });
    const updateData = { label: itinaryName, place_ids: placesArray };
    updateItinaryRequest(pickItinaryId, updateData, pickItinaryIndex);
    this.setState({ formError: undefined });
  };

  isEditedItinary = () => {
    const { isEdited } = this.state;
    this.setState({ isEdited: !isEdited, isNewItinary: false });
    this.props.addressSteps;
  };

  handleNameNewItinary = itinaryName => {
    this.setState({ itinaryName });
  };

  handleChangeDropDown = (index, obj) => {
    const { fetchItinaryMapRequest, resetForm } = this.props;
    resetForm();
    this.setState({
      pickItinaryId: obj && obj.id,
      pickItinaryIndex: index,
      pickItinary: obj,
      itinaryName: obj && obj.label,
      isEdited: false,
      isNewItinary: false,
      formError: undefined
    });
    if (obj) {
      fetchItinaryMapRequest(obj);
    }
  };

  isNewItinary = () => {
    const { resetForm, reset } = this.props;
    this.setState({
      isNewItinary: true,
      isEdited: false,
      itinaryName: '',
      pickItinaryIndex: null,
      pickItinary: null,
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
      itinaryName,
      pickItinaryId,
      isEdited,
      pickItinary,
      isNewItinary
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
            React / Redux itinary :
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
                  pickItinaryId={pickItinaryId}
                />
                <Flex mt={2}>
                  <ButtonWithCustomStyles
                    bg={Colors.primary}
                    width={1 / 2}
                    onClick={this.isNewItinary}
                  >
                    <Text>New Itinary</Text>
                  </ButtonWithCustomStyles>
                </Flex>
                {(pickItinary || isEdited) && (
                  <Fragment>
                    <Subhead mt={2}>
                      <ButtonWithCustomStyles
                        bg={Colors.primary}
                        width={1 / 2}
                        onClick={this.isEditedItinary}
                      >
                        <Text>Editer</Text>
                      </ButtonWithCustomStyles>
                    </Subhead>
                    <Subhead mt={2}>
                      <ButtonWithCustomStyles
                        bg={Colors.primary}
                        width={1 / 2}
                        onClick={this.deleteItinary}
                      >
                        <Text>Supprimer</Text>
                      </ButtonWithCustomStyles>
                    </Subhead>
                  </Fragment>
                )}
                {(isEdited || isNewItinary) && (
                  <Fragment>
                    <Subhead mt={4} fontSize={3} mb={15}>
                      Your itinary :
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
                          onChange: this.handleNameNewItinary,
                          value: itinaryName
                        }}
                        meta={{}}
                        placeholder="Itinary name"
                        required={false}
                        saveButton={isEdited ? false : this.saveItinary}
                        onSave={this.saveItinary}
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
                            onClick={this.updateItinary}
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
                          onClick={this.addItinaryStep}
                        >
                          <Text>Add step</Text>
                        </ButtonOutlineWithCustomStyles>
                        <ButtonWithCustomStyles
                          bg={Colors.primary}
                          width={1 / 2}
                          onClick={this.optimizeItinary}
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
                      href="https://github.com/nbdn/next-redux-itinary"
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
  optimizeItinary: PropTypes.func,
  optimizedFormError: PropTypes.string,
  removePlace: PropTypes.func,
  reset: PropTypes.func,
  updatePlacesOrder: PropTypes.func,
  addItinaryRequest: PropTypes.func,
  deleteItinaryRequest: PropTypes.func,
  updateItinaryRequest: PropTypes.func,
  fetchItinaryRequest: PropTypes.func,
  fetchItinaryMapRequest: PropTypes.func,
  places: PropTypes.array,
  itineraries: PropTypes.array,
  resetForm: PropTypes.func,
  initialItinary: PropTypes.string
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
  optimizeItinary,
  removePlace,
  updatePlacesOrder,
  addItinaryRequest,
  deleteItinaryRequest,
  updateItinaryRequest,
  fetchItinaryRequest,
  fetchItinaryMapRequest,
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
