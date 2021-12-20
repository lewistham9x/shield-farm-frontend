import { reducer as snackbarReducer } from "./snackbar";
import {
  VAULT_FETCH_APYS_BEGIN,
  VAULT_FETCH_APYS_SUCCESS,
  VAULT_FETCH_APYS_FAILURE,
} from "./constants";

const reducers = [snackbarReducer];

const initialState = {
  pools: [],
};

export default function reducer(state = initialState, action) {
  let newState;

  switch (action.type) {
    // Handle cross-topic actions here
    case VAULT_FETCH_APYS_SUCCESS:
      newState = {
        ...state,
        pools: action.data,
      };
      break;

    default:
      newState = state;
      break;
  }

  /* istanbul ignore next */
  return newState;
  // return reducers.reduce((s, r) => r(s, action), newState);
}
