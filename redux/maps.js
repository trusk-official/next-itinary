import { createSelector } from 'reselect';
import Immutable from 'seamless-immutable';

export const NAME = 'MAPS';

/* ------------- Actions ------------- */

export const ADD_PLACE = `${NAME}/ADD_PLACE`;
export const REMOVE_PLACE = `${NAME}/REMOVE_PLACE`;
export const UPDATE_PLACES_ORDER = `${NAME}/UPDATE_PLACES_ORDER`;

export const ADD_ADDRESS_STEP = `${NAME}/ADD_ADDRESS_STEP`;

export const FETCH_INIT_FORM = `${NAME}/FETCH_INIT_FORM`;
export const FETCH_INIT_FORM_FAILED = `${NAME}/FETCH_INIT_FORM_FAILED`;
export const RESOLVE_INIT_FORM = `${NAME}/RESOLVE_INIT_FORM`;

export const FETCH_OPTIMIZE_ITINARY = `${NAME}/FETCH_OPTIMIZE_ITINARY`;
export const FETCH_OPTIMIZE_ITINARY_FAILED = `${NAME}/FETCH_OPTIMIZE_ITINARY_FAILED`;
export const RESOLVE_OPTIMIZE_ITINARY = `${NAME}/RESOLVE_OPTIMIZE_ITINARY`;

export const ADD_ITINARY_REQUEST = `${NAME}/ADD_ITINARY_REQUEST`;
export const ADD_ITINARY_SUCCESS = `${NAME}/ADD_ITINARY_SUCCESS`;
export const ADD_ITINARY_FAILED = `${NAME}/ADD_ITINARY_FAILED`;

export const DELETE_ITINARY_REQUEST = `${NAME}/DELETE_ITINARY_REQUEST`;
export const DELETE_ITINARY_SUCCESS = `${NAME}/DELETE_ITINARY_SUCCESS`;
export const DELETE_ITINARY_FAILED = `${NAME}/DELETE_ITINARY_FAILED`;

export const UPDATE_ITINARY_REQUEST = `${NAME}/UPDATE_ITINARY_REQUEST`;
export const UPDATE_ITINARY_SUCCESS = `${NAME}/UPDATE_ITINARY_SUCCESS`;
export const UPDATE_ITINARY_FAILED = `${NAME}/UPDATE_ITINARY_FAILED`;

export const FETCH_ITINARY_REQUEST = `${NAME}/FETCH_ITINARY_REQUEST`;
export const FETCH_ITINARY_SUCCESS = `${NAME}/FETCH_ITINARY_SUCCESS`;
export const FETCH_ITINARY_FAILED = `${NAME}/FETCH_ITINARY_FAILED`;

export const FETCH_ITINARY_MAP_REQUEST = `${NAME}/FETCH_ITINARY_MAP_REQUEST`;
export const FETCH_ITINARY_MAP_SUCCESS = `${NAME}/FETCH_ITINARY_MAP_SUCCESS`;
export const FETCH_ITINARY_MAP_FAILED = `${NAME}/FETCH_ITINARY_MAP_FAILED`;

export const RESET_FORM = `${NAME}/RESET_FORM`;

/* ------------- Initial State ------------- */

export const initialMapsState = Immutable({
  addressSteps: [],
  addressStepsOrders: [],
  fetching: true,
  fetchingOptimize: false,
  initError: undefined,
  optimizedError: undefined,
  places: [],
  itineraries: [],
  addError: undefined,
  deleteError: undefined,
  updateError: undefined,
  fetchError: undefined
});

/* ------------- Reducer ------------- */

function reducer(state = initialMapsState, action) {
  switch (action.type) {
    case ADD_ADDRESS_STEP:
      return state.merge({
        addressSteps: [...state.addressSteps, action.addressStep]
      });
    case ADD_PLACE:
      return state.merge({ places: [...state.places, action.place] });
    case FETCH_INIT_FORM:
      return state.merge({ fetching: true, initError: undefined });
    case FETCH_INIT_FORM_FAILED:
      return state.merge({ fetching: false, optimizedError: action.message });
    case FETCH_OPTIMIZE_ITINARY:
      return state.merge({
        fetchingOptimize: true,
        optimizedError: undefined
      });
    case FETCH_OPTIMIZE_ITINARY_FAILED:
      return state.merge({
        fetchingOptimize: false,
        optimizedError: action.message
      });
    case REMOVE_PLACE:
      return state.merge({
        addressSteps: action.removeInput
          ? state.addressSteps.filter(adr => adr.id !== action.placeInputId)
          : state.addressSteps,
        places: state.places.filter(p => p.inputId !== action.placeInputId)
      });
    case RESOLVE_INIT_FORM:
    case RESOLVE_OPTIMIZE_ITINARY:
      return state.merge({
        addressSteps: action.addressSteps,
        addressStepsOrders: action.addressStepsOrders,
        places: action.places,
        fetching: false,
        fetchingOptimize: false
      });
    case UPDATE_PLACES_ORDER:
      return state.merge({
        places: action.orderedPlaces,
        addressSteps: action.addressSteps,
        addressStepsOrders: action.addressStepsOrders
      });
    case ADD_ITINARY_REQUEST:
      return state.merge({ fetching: true, addError: undefined });
    case ADD_ITINARY_SUCCESS:
      return state.merge({
        fetching: false,
        itineraries: [...state.itineraries, action.itinerary]
      });
    case ADD_ITINARY_FAILED:
      return state.merge({ fetching: false, addError: action.message });
    case DELETE_ITINARY_REQUEST:
      return state.merge({ fetching: true, deleteError: undefined });
    case DELETE_ITINARY_SUCCESS: {
      let itineraryDelete = state.itineraries.asMutable();
      itineraryDelete.splice(action.pickItineraryIndex, 1);
      return state.merge({ fetching: false, itineraries: itineraryDelete });
    }
    case DELETE_ITINARY_FAILED:
      return state.merge({ fetching: false, deleteError: action.message });
    case UPDATE_ITINARY_REQUEST:
      return state.merge({ fetching: true, updateError: undefined });
    case UPDATE_ITINARY_SUCCESS: {
      let itinerariesUpdate = state.itineraries.asMutable();
      itinerariesUpdate[action.pickItineraryIndex] = action.itineraryUpdate;
      return state.merge({ fetching: false, itineraries: itinerariesUpdate });
    }
    case UPDATE_ITINARY_FAILED:
      return state.merge({ fetching: false, updateError: action.message });
    case FETCH_ITINARY_REQUEST:
      return state.merge({ fetching: true, fetchError: undefined });
    case FETCH_ITINARY_SUCCESS:
      return state.merge({
        fetching: false,
        itineraries: action.itineraries
      });
    case FETCH_ITINARY_FAILED:
      return state.merge({ fetching: false, fetchError: action.message });
    case FETCH_ITINARY_MAP_REQUEST:
      return state.merge({ fetching: true, fetchError: undefined });
    case FETCH_ITINARY_MAP_SUCCESS:
      return state.merge({
        addressSteps: action.addressSteps,
        addressStepsOrders: action.addressStepsOrders,
        places: action.places,
        fetching: false,
        fetchingOptimize: false
      });
    case FETCH_ITINARY_MAP_FAILED:
      return state.merge({ fetching: false, fetchError: action.message });
    case RESET_FORM:
      return state.merge({
        addressSteps: [
          { required: true, stepNum: 0, id: Date.now() },
          { required: true, stepNum: 1, id: Date.now() + 1 }
        ],
        addressStepsOrders: [],
        fetching: false,
        fetchingOptimize: false,
        initError: undefined,
        optimizedError: undefined,
        places: [],
        addError: undefined,
        deleteError: undefined,
        updateError: undefined,
        fetchError: undefined
      });
    default:
      return state;
  }
}

/* ------------- Actions creators ------------- */

export const addAddressStep = addressStep => dispatch =>
  dispatch({ type: ADD_ADDRESS_STEP, addressStep });

export const addPlace = place => dispatch =>
  dispatch({ type: ADD_PLACE, place });

export const removePlace = (placeInputId, removeInput) => dispatch =>
  dispatch({ type: REMOVE_PLACE, placeInputId, removeInput });

export const updatePlacesOrder = (
  addressSteps,
  addressStepsOrders,
  requiredFieldsCount
) => (dispatch, getState) => {
  const places = getPlaces(getState());
  const updatedAddressSteps = addressSteps.map((adr, iAdr) => {
    const stepNum = addressStepsOrders.findIndex(o => o === iAdr);

    return {
      ...adr,
      stepNum: stepNum,
      required: stepNum < requiredFieldsCount
    };
  });
  const orderedPlaces = places.map(place => {
    const stepNum = updatedAddressSteps.find(adr => adr.id === place.inputId)
      .stepNum;
    return { ...place, stepNum };
  });
  dispatch({
    type: UPDATE_PLACES_ORDER,
    addressSteps: updatedAddressSteps,
    addressStepsOrders,
    orderedPlaces
  });
};

export const initForm = (placesId = [], requiredFieldsCount) => dispatch =>
  dispatch({ type: FETCH_INIT_FORM, placesId, requiredFieldsCount });

export const optimizeItinerary = requiredFieldsCount => (dispatch, getState) => {
  const places = getPlaces(getState());
  const orderedPlacesIds = getOrderedPlacesIds(getState());
  dispatch({
    type: FETCH_OPTIMIZE_ITINARY,
    places,
    orderedPlacesIds,
    requiredFieldsCount
  });
};

export const addItineraryRequest = (places, itineraryName) => dispatch => {
  dispatch({ type: ADD_ITINARY_REQUEST, places, itineraryName });
};

export const addItinerarySuccess = itinerary => dispatch =>
  dispatch({ type: ADD_ITINARY_SUCCESS, itinerary });

export const addItineraryFailed = (placeInputId, removeInput) => dispatch =>
  dispatch({ type: ADD_ITINARY_FAILED, placeInputId, removeInput });

export const deleteItineraryRequest = (
  itineraryId,
  pickItineraryIndex
) => dispatch => {
  dispatch({
    type: DELETE_ITINARY_REQUEST,
    itineraryId,
    pickItineraryIndex
  });
};

export const deleteItinerarySuccess = place => dispatch =>
  dispatch({ type: DELETE_ITINARY_SUCCESS, place });

export const deleteItineraryFailed = (placeInputId, removeInput) => dispatch =>
  dispatch({ type: DELETE_ITINARY_FAILED, placeInputId, removeInput });

export const updateItineraryRequest = (
  pickItineraryId,
  updateData,
  pickItineraryIndex
) => dispatch => {
  dispatch({
    type: UPDATE_ITINARY_REQUEST,
    pickItineraryId,
    updateData,
    pickItineraryIndex
  });
};

export const updateItinerarySuccess = (
  itineraryUpdate,
  pickItineraryIndex
) => dispatch =>
  dispatch({ type: UPDATE_ITINARY_SUCCESS, itineraryUpdate, pickItineraryIndex });

export const updateItineraryFailed = (placeInputId, removeInput) => dispatch =>
  dispatch({ type: UPDATE_ITINARY_FAILED, placeInputId, removeInput });

export const fetchItineraryRequest = (places, itineraryName) => dispatch => {
  dispatch({ type: FETCH_ITINARY_REQUEST, places, itineraryName });
};

export const fetchItinerarySuccess = place => dispatch =>
  dispatch({ type: FETCH_ITINARY_SUCCESS, place });

export const fetchItineraryFailed = (placeInputId, removeInput) => dispatch =>
  dispatch({ type: FETCH_ITINARY_FAILED, placeInputId, removeInput });

export const fetchItineraryMapRequest = itinerary => dispatch => {
  dispatch({ type: FETCH_ITINARY_MAP_REQUEST, itinerary });
};

export const fetchItineraryMapSuccess = (
  addressSteps,
  addressStepsOrders,
  places
) => dispatch =>
  dispatch({
    type: FETCH_ITINARY_MAP_SUCCESS,
    addressSteps,
    addressStepsOrders,
    places
  });

export const fetchItineraryMapFailed = (placeInputId, removeInput) => dispatch =>
  dispatch({ type: FETCH_ITINARY_MAP_FAILED, placeInputId, removeInput });

export const resetForm = () => dispatch => {
  dispatch({ type: RESET_FORM });
};

/* ------------- Selectors ------------- */

export const getAddressSteps = state => state[NAME].addressSteps;

export const getAddressStepsOrders = state => state[NAME].addressStepsOrders;

export const getInitError = state => state[NAME].initError;

export const getOptimizedError = state => state[NAME].optimizedError;

export const getFetching = state => state[NAME].fetching;

export const getFetchingOptimize = state => state[NAME].fetchingOptimize;

export const getPlaces = state => state[NAME].places;

export const getItineraries = state => state[NAME].itineraries;

export const getOrderedPlaces = createSelector(getPlaces, places =>
  [...places].sort((place1, place2) => place1.stepNum - place2.stepNum)
);

export const getOrderedPlacesIds = createSelector(getPlaces, places =>
  [...places]
    .sort((place1, place2) => place1.stepNum - place2.stepNum)
    .map(p => p.id)
);

export const isFormValid = createSelector(
  [getAddressSteps, getPlaces],
  (addressSteps, places) => {
    let isValid = true;
    if (!addressSteps || !addressSteps.length) {
      return false;
    }
    addressSteps.forEach(adr => {
      if (!places.find(p => p.inputId === adr.id)) {
        isValid = false;
      }
    });
    return isValid;
  }
);

export default { [NAME]: reducer };
