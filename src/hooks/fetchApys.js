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
      // const doRequest = axios.get(`https://shieldapi.miim.club/pools/cached`);
      const doRequest = axios.get(`http://localhost:3001/pools/cached/MATIC`);

      doRequest.then((res) => {
        const doRequestTokens = axios.get(`https://shieldapi.miim.club/tokens`);

        // add token's data to pools

        doRequestTokens.then(
          (resTokens) => {
            const pools = res.data;
            const tokens = resTokens.data;
            const poolsWithTokens = pools
              .map((pool) => {
                const rewardToken = tokens[pool.nativeToken];
                const lpToken = tokens[pool.lpToken];

                if (lpToken && rewardToken) {
                  return {
                    // rewardTokenContract: rewardToken.contract,
                    // rewardTokenPrice: rewardToken.price,
                    // rewardTokenChainName: rewardToken.chainName,
                    // rewardTokenName: rewardToken.name,
                    // rewardTokenSymbol: rewardToken.symbol,
                    // rewardTokenDecimals: rewardToken.decimals,
                    ...pool,
                    rewardToken: rewardToken,
                    lpToken: lpToken,
                  };
                } else {
                  return null;
                }
              })
              .filter((pool) => pool !== null);

            console.log("poolsWithTokens", poolsWithTokens);
            dispatch({
              type: VAULT_FETCH_APYS_SUCCESS,
              data: poolsWithTokens,
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
    });
  };
}

export function updatePool(data, addLoadingPool, removeLoadingPool) {
  const pool = data.pool;
  const pools = data.pools;

  return (dispatch) => {
    dispatch({
      type: VAULT_UPDATE_POOL_BEGIN,
    });

    addLoadingPool(pool);

    return new Promise((resolve, reject) => {
      const doRequest = axios.get(
        `https://shieldapi.miim.club/pools/${pool.farm}/${pool.id}`
      );

      // console.log("pools", pools);

      doRequest.then(
        (res) => {
          removeLoadingPool(pool);

          dispatch({
            type: VAULT_UPDATE_POOL_SUCCESS,
            data: res.data,
          });

          var newPools = [];

          for (const pool of pools) {
            if (pool.id === res.data.id && pool.farm === res.data.farm) {
              const newPool = {
                ...pool,
                ...res.data,
              };
              console.log("Replaced pool to", newPool);
              newPools.push(newPool);
            } else {
              newPools.push(pool);
            }
          }

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
      pools: state.pool.pools,
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
      pool: state.pool.pool,
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
    updatePool: boundAction,
    updatePoolDone,
    updatePoolPending,
  };
}
