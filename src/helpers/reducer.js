import { reducer as snackbarReducer } from "./snackbar";
import {
  VAULT_FETCH_APYS_BEGIN,
  VAULT_FETCH_APYS_SUCCESS,
  VAULT_FETCH_APYS_FAILURE,
  VAULT_UPDATE_POOL_BEGIN,
  VAULT_UPDATE_POOL_SUCCESS,
  VAULT_UPDATE_POOL_FAILURE,
} from "./constants";

const reducers = [snackbarReducer];

const initialState = {
  pools: [],
  fetchApysPending: true,
  fetchApysDone: false,
};

export default function reducer(state = initialState, action) {
  let newState;

  switch (action.type) {
    // Handle cross-topic actions here
    case VAULT_FETCH_APYS_BEGIN:
      newState = {
        ...state,
        fetchApysDone: false,
        fetchApysPending: true,
      };
      break;
    case VAULT_FETCH_APYS_SUCCESS:
      newState = {
        ...state,
        pools: action.data,
        fetchApysDone: true,
        fetchApysPending: false,
      };
      break;
    case VAULT_FETCH_APYS_FAILURE:
      newState = {
        ...state,
        fetchApysDone: false,
        fetchApysPending: true,
      };
      break;
    case VAULT_UPDATE_POOL_BEGIN:
      newState = {
        ...state,
      };
      break;
    case VAULT_UPDATE_POOL_SUCCESS:
      newState = {
        ...state,
        pool: action.data,
      };
      break;
    case VAULT_UPDATE_POOL_FAILURE:
      newState = {
        ...state,
      };
      break;
    default:
      newState = state;
      break;
  }

  return reducers.reduce((s, r) => r(s, action), newState);
}
