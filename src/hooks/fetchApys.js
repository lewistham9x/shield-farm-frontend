import axios from "axios";
import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import {
  VAULT_FETCH_APYS_BEGIN,
  VAULT_FETCH_APYS_SUCCESS,
  VAULT_FETCH_APYS_FAILURE,
} from "../helpers/constants";

export function fetchApys() {
  return (dispatch) => {
    dispatch({
      type: VAULT_FETCH_APYS_BEGIN,
    });
    return new Promise((resolve, reject) => {
      const doRequest = axios.get(`https://shieldapi.miim.club/pools/cached`);

      doRequest.then(
        (res) => {
          dispatch({
            type: VAULT_FETCH_APYS_SUCCESS,
            data: res.data,
          });
          resolve(res);
        },
        (err) => {
          dispatch({
            type: VAULT_FETCH_APYS_FAILURE,
            data: { error: err },
          });
          reject(err);
        }
      );
    });
  };
}

export function useFetchApys() {
  const dispatch = useDispatch();

  const pools = useSelector((state) => state.pools);

  const boundAction = useCallback(() => {
    dispatch(fetchApys());
  }, [dispatch]);

  return {
    pools,
    // return {
    fetchApys: boundAction,
    // fetchApysDone,
    // fetchApysPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case VAULT_FETCH_APYS_BEGIN:
      return {
        ...state,
        fetchApysPending: true,
      };

    case VAULT_FETCH_APYS_SUCCESS:
      return {
        ...state,
        apys: action.data,
        fetchApysDone: true,
        fetchApysPending: false,
      };

    case VAULT_FETCH_APYS_FAILURE:
      return {
        ...state,
        fetchApysPending: false,
      };

    default:
      return state;
  }
}
