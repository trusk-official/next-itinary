/*global google:true*/
/*eslint no-undef: "error"*/
import { call, put, takeLatest } from 'redux-saga/effects';

import {
  FETCH_INIT_FORM,
  FETCH_INIT_FORM_FAILED,
  RESOLVE_INIT_FORM,
  FETCH_OPTIMIZE_ITINARY,
  FETCH_OPTIMIZE_ITINARY_FAILED,
  RESOLVE_OPTIMIZE_ITINARY,
  ADD_ITINARY_REQUEST,
  ADD_ITINARY_SUCCESS,
  ADD_ITINARY_FAILED,
  DELETE_ITINARY_REQUEST,
  DELETE_ITINARY_SUCCESS,
  DELETE_ITINARY_FAILED,
  UPDATE_ITINARY_REQUEST,
  UPDATE_ITINARY_SUCCESS,
  UPDATE_ITINARY_FAILED,
  FETCH_ITINARY_REQUEST,
  FETCH_ITINARY_SUCCESS,
  FETCH_ITINARY_FAILED,
  FETCH_ITINARY_MAP_REQUEST,
  FETCH_ITINARY_MAP_SUCCESS,
  FETCH_ITINARY_MAP_FAILED
} from '../redux/maps';

import { parseGooglePlace } from '../helpers/';
import PlacesService from '../services/Places';
import ItinariesService from '../services/Itinaries';

function* fetchInitForm({ placesId = [], requiredFieldsCount = 2 }) {
  try {
    if (requiredFieldsCount < 2) {
      throw new Error('Required fields count must be at least 2.');
    }
    const { addressSteps, addressStepsOrders, places } = yield call(
      buildAddressInputs,
      placesId
    );

    yield put({
      type: RESOLVE_INIT_FORM,
      addressSteps,
      addressStepsOrders,
      places
    });
  } catch (e) {
    /* eslint-disable no-console */
    console.error('=> Err init form', e);
    /* eslint-enable */
    yield put({ type: FETCH_INIT_FORM_FAILED, message: e.message });
  }
}

function* fetchOptimizeItinary({
  places = [],
  orderedPlacesIds = [],
  requiredFieldsCount = 2
}) {
  try {
    if (places.length < 4) {
      throw new Error(
        'You must have fill at least 2 steps for optimizing routes.'
      );
    }
    const { error, response } = yield call(
      PlacesService.optimizeItinary,
      orderedPlacesIds
    );
    if (response) {
      const addressSteps = [];
      const addressStepsOrders = [];
      const orderedPlaces = [];
      for (let i = 0; i < response.length; i++) {
        const inputId = (Date.now() + i).toString();
        const parsedPlace = {
          ...places.find(p => p.id === response[i]),
          inputId,
          stepNum: i
        };
        addressStepsOrders.push(i);
        addressSteps.push({
          required: i < requiredFieldsCount,
          stepNum: i,
          id: inputId,
          initialValue: parsedPlace.address
        });
        orderedPlaces.push(parsedPlace);
      }
      yield put({
        type: RESOLVE_OPTIMIZE_ITINARY,
        addressSteps,
        addressStepsOrders,
        places: orderedPlaces
      });
    } else if (error) {
      yield put({
        type: FETCH_OPTIMIZE_ITINARY_FAILED,
        message: error.message
      });
    }
  } catch (e) {
    /* eslint-disable no-console */
    console.error('=> Err optimizing itinary', e);
    /* eslint-enable */
    yield put({ type: FETCH_OPTIMIZE_ITINARY_FAILED, message: e.message });
  }
}

function* addItinary({ places, itinaryName }) {
  try {
    let placesArray = [];
    places.map(place => {
      placesArray.push(place.id);
    });
    const data = {
      label: itinaryName,
      place_ids: placesArray
    };
    const { error, response } = yield call(
      ItinariesService.createItinaries,
      data
    );

    if (response) {
      const itinary = response[0];
      yield put({
        type: ADD_ITINARY_SUCCESS,
        itinary
      });
    } else if (error) {
      yield put({
        type: ADD_ITINARY_FAILED
      });
    }
  } catch (e) {
    /* eslint-disable no-console */
    console.error('=> Err init form', e);
    /* eslint-enable */
    yield put({
      type: ADD_ITINARY_FAILED
    });
  }
}

function* deleteItinary({ itinaryId, pickItinaryIndex }) {
  try {
    const { error, response } = yield call(
      ItinariesService.deleteItinaries,
      itinaryId
    );

    if (response) {
      yield put({
        type: DELETE_ITINARY_SUCCESS,
        pickItinaryIndex
      });
    } else if (error) {
      yield put({
        type: DELETE_ITINARY_FAILED
      });
    }
  } catch (e) {
    /* eslint-disable no-console */
    console.error('=> Err init form', e);
    /* eslint-enable */
    yield put({
      type: DELETE_ITINARY_FAILED
    });
  }
}

function* updateItinary({ pickItinaryId, updateData, pickItinaryIndex }) {
  try {
    const { error, response } = yield call(
      ItinariesService.updateItinaries,
      pickItinaryId,
      updateData
    );

    if (response) {
      const itinaryUpdate = response[0];
      yield put({
        type: UPDATE_ITINARY_SUCCESS,
        itinaryUpdate,
        pickItinaryIndex
      });
    } else if (error) {
      yield put({
        type: UPDATE_ITINARY_FAILED
      });
    }
  } catch (e) {
    /* eslint-disable no-console */
    console.error('=> Err init form', e);
    /* eslint-enable */
    yield put({
      type: UPDATE_ITINARY_FAILED
    });
  }
}

function* fetchItinary() {
  try {
    const { error, response } = yield call(ItinariesService.getAllItinaries);

    if (response) {
      const itineraries = response.itineraries;
      yield put({
        type: FETCH_ITINARY_SUCCESS,
        itineraries
      });
    } else if (error) {
      yield put({
        type: FETCH_ITINARY_FAILED
      });
    }
  } catch (e) {
    /* eslint-disable no-console */
    console.error('=> Err init form', e);
    /* eslint-enable */
    yield put({
      type: FETCH_ITINARY_FAILED
    });
  }
}

function* fetchItinaryForMap({ itinary }) {
  try {
    //const test =  buildAddressInputs(itinary.place_ids)
    const { addressSteps, addressStepsOrders, places } = yield call(
      buildAddressInputs,
      itinary.place_ids
    );

    yield put({
      type: FETCH_ITINARY_MAP_SUCCESS,
      addressSteps,
      addressStepsOrders,
      places
    });
  } catch (e) {
    /* eslint-disable no-console */
    console.error('=> Err init form', e);
    /* eslint-enable */
    yield put({
      type: FETCH_ITINARY_MAP_FAILED
    });
  }
}

function* buildAddressInputs(placesId, requiredFieldsCount = 2) {
  const geocoder = new google.maps.Geocoder();
  const addressSteps = [];
  const places = [];
  const addressStepsOrders = [];

  // Geocode place ids with Google geocode API
  for (let i = 0; i < placesId.length; i++) {
    const inputId = (Date.now() + i).toString();
    const { error, response } = yield call(
      PlacesService.fetchPlaceInfos,
      geocoder,
      placesId[i]
    );
    if (error) {
      throw new Error(`Invalid place id : ${placesId[i]}`);
    } else if (response) {
      const parsedPlace = parseGooglePlace(response, i, inputId);
      addressStepsOrders.push(i);
      addressSteps.push({
        required: i < requiredFieldsCount,
        stepNum: i,
        id: inputId,
        initialValue: parsedPlace.address
      });
      places.push(parsedPlace);
    }
  }

  // Fill required fields if needing
  if (placesId.length < requiredFieldsCount) {
    for (let i = placesId.length; i < requiredFieldsCount; i++) {
      addressStepsOrders.push(i);
      addressSteps.push({
        required: true,
        stepNum: i,
        id: (Date.now() + i).toString()
      });
    }
  }
  return { addressSteps, addressStepsOrders, places };
}

function* mapsSaga() {
  yield takeLatest(FETCH_INIT_FORM, fetchInitForm);
  yield takeLatest(FETCH_OPTIMIZE_ITINARY, fetchOptimizeItinary);
  yield takeLatest(ADD_ITINARY_REQUEST, addItinary);
  yield takeLatest(DELETE_ITINARY_REQUEST, deleteItinary);
  yield takeLatest(UPDATE_ITINARY_REQUEST, updateItinary);
  yield takeLatest(FETCH_ITINARY_REQUEST, fetchItinary);
  yield takeLatest(FETCH_ITINARY_MAP_REQUEST, fetchItinaryForMap);
}

export default mapsSaga;
