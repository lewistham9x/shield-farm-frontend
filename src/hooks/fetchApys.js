import axios from "axios";
import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import {
  VAULT_FETCH_APYS_BEGIN,
  VAULT_FETCH_APYS_SUCCESS,
  VAULT_FETCH_APYS_FAILURE,
  VAULT_UPDATE_POOL_BEGIN,
  VAULT_UPDATE_POOL_SUCCESS,
  VAULT_UPDATE_POOL_FAILURE,
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

export function updatePool(farm, id, pools) {
  return (dispatch) => {
    dispatch({
      type: VAULT_UPDATE_POOL_BEGIN,
      data: { farm: farm, id: id },
    });
    return new Promise((resolve, reject) => {
      const doRequest = axios.get(
        `https://shieldapi.miim.club/pools/${farm}/${id}`
      );

      doRequest.then(
        (res) => {
          dispatch({
            type: VAULT_UPDATE_POOL_SUCCESS,
            data: res.data,
          });

          // console.log("Got second request", pools);

          var newPools = [];

          for (const pool of pools) {
            if (pool.id === res.data.id && pool.farm === res.data.farm) {
              newPools.push(res.data);
            } else {
              newPools.push(pool);
            }
          }

          res.data = newPools;

          dispatch({
            type: VAULT_FETCH_APYS_SUCCESS,
            data: newPools,
          });

          resolve(res);
        },
        (err) => {
          dispatch({
            type: VAULT_UPDATE_POOL_FAILURE,
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

  const { pools, fetchApysPending, fetchApysDone } = useSelector(
    (state) => ({
      pools: state.pools,
      fetchApysDone: state.fetchApysDone,
      fetchApysPending: state.fetchApysPending,
    }),
    shallowEqual
  );

  const boundAction = useCallback(() => {
    dispatch(fetchApys());
  }, [dispatch]);

  return {
    pools,
    fetchApys: boundAction,
    fetchApysDone,
    fetchApysPending,
  };
}

export function useUpdatePool() {
  const dispatch = useDispatch();

  const { pool, updatePoolPending, updatePoolDone } = useSelector(
    (state) => ({
      pool: state.pool,
      updatePoolPending: state.updatePoolPending,
      updatePoolDone: state.updatePoolDone,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (farm, id, pools) => {
      dispatch(updatePool(farm, id, pools));
    },
    [dispatch]
  );

  return {
    pool,
    updatePool: boundAction,
    updatePoolDone,
    updatePoolPending,
  };
}
