import BigNumber from "bignumber.js";
import { useCallback } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  VAULT_FETCH_BALANCES_BEGIN,
  VAULT_FETCH_BALANCES_SUCCESS,
  VAULT_FETCH_BALANCES_FAILURE,
} from "../helpers/constants";
import { MultiCall } from "eth-multicall";
import {
  erc20ABI,
  multicallABI,
  uniswapV2PairABI,
  launchPoolABI,
} from "../abis";
import { byDecimals } from "../helpers/bignumber";
import { getNetworkMulticall } from "../helpers/getNetworkData";

export function fetchBalances({ address, web3, balances, pools }) {
  return (dispatch) => {
    if (!(address && web3)) return;

    dispatch({
      type: VAULT_FETCH_BALANCES_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const multicall = new MultiCall(web3, getNetworkMulticall());

      const balanceCalls = [];
      const allowanceCalls = [];
      const launchPoolBalanceCalls = [];

      console.log("fetchBalances", balances);

      Object.entries(balances).forEach(([symbol, token]) => {
        if (!token.tokenAddress) {
          const multicallContract = new web3.eth.Contract(
            multicallABI,
            multicall.contract
          );
          balanceCalls.push({
            balance: multicallContract.methods.getEthBalance(address),
            symbol: symbol,
          });
        } else {
          const tokenContract = new web3.eth.Contract(
            erc20ABI,
            token.tokenAddress
          );
          balanceCalls.push({
            balance: tokenContract.methods.balanceOf(address),
            symbol: symbol,
          });
          Object.entries(token.allowance).forEach(([spender]) => {
            allowanceCalls.push({
              allowance: tokenContract.methods.allowance(address, spender),
              spender: spender,
              symbol: symbol,
            });
          });
        }
      });

      Object.entries(pools).forEach((launchpool) => {
        if (launchpool.earnContractAddress) {
          const multicallContract = new web3.eth.Contract(
            launchPoolABI,
            launchpool.earnContractAddress
          );
          launchPoolBalanceCalls.push({
            balance: multicallContract.methods.balanceOf(address),
            symbol: launchpool.token,
          });
        }
      });

      multicall
        .all([balanceCalls, allowanceCalls, launchPoolBalanceCalls])
        .then(
          ([balanceResults, allowanceResults, launchpoolBalanceResults]) => {
            const newTokens = {};

            balanceResults.forEach((balanceResult) => {
              newTokens[balanceResult.symbol] = {
                ...balances[balanceResult.symbol],
                tokenBalance: balanceResult.balance,
                launchpoolTokenBalance: "0",
              };
            });

            allowanceResults.forEach((allowanceResult) => {
              newTokens[allowanceResult.symbol] = {
                ...newTokens[allowanceResult.symbol],
                allowance: {
                  ...newTokens[allowanceResult.symbol].allowance,
                  [allowanceResult.spender]: allowanceResult.allowance,
                },
              };
            });

            launchpoolBalanceResults.forEach((launchPoolBalanceResult) => {
              const previousBalance =
                newTokens[launchPoolBalanceResult.symbol]
                  ?.launchpoolTokenBalance || 0;
              newTokens[launchPoolBalanceResult.symbol] = {
                ...newTokens[launchPoolBalanceResult.symbol],
                launchpoolTokenBalance: new BigNumber.sum(
                  launchPoolBalanceResult.balance,
                  previousBalance
                ).toString(),
              };
            });

            dispatch({
              type: VAULT_FETCH_BALANCES_SUCCESS,
              data: newTokens,
            });
            resolve();
          }
        )
        .catch((error) => {
          dispatch({
            type: VAULT_FETCH_BALANCES_FAILURE,
          });
          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function fetchPairReverves({ web3, pairToken }) {
  return (dispatch) => {
    if (!web3) return;

    dispatch({
      type: VAULT_FETCH_BALANCES_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const multicall = new MultiCall(web3, getNetworkMulticall());
      const tokenContract = new web3.eth.Contract(
        uniswapV2PairABI,
        pairToken.tokenAddress
      );
      multicall
        .all([
          [
            {
              totalSupply: tokenContract.methods.totalSupply(),
              token0: tokenContract.methods.token0(),
              token1: tokenContract.methods.token1(),
              reserves: tokenContract.methods.getReserves(),
            },
          ],
        ])
        .then(([[result]]) => {
          const newPairToken = {
            [pairToken.symbol]: {
              ...pairToken,
              ...result,
            },
          };

          dispatch({
            type: VAULT_FETCH_BALANCES_SUCCESS,
            data: newPairToken,
          });
          resolve();
        })
        .catch((error) => {
          dispatch({
            type: VAULT_FETCH_BALANCES_FAILURE,
          });
          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function useFetchBalances() {
  const dispatch = useDispatch();

  const { balances, fetchBalancesPending, fetchBalancesDone } = useSelector(
    (state) => ({
      balances: state.vault.balances,
      fetchBalancesDone: state.vault.fetchBalancesDone,
      fetchBalancesPending: state.vault.fetchBalancesPending,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchBalances(data));
    },
    [dispatch]
  );

  const tokenBalance = (tokenSymbol) => {
    return byDecimals(
      balances[tokenSymbol]?.tokenBalance || 0,
      balances[tokenSymbol].decimals
    );
  };

  const boundPairReverves = useCallback(
    (data) => {
      return dispatch(fetchPairReverves(data));
    },
    [dispatch]
  );

  return {
    balances,
    tokenBalance: tokenBalance,
    fetchBalances: boundAction,
    fetchPairReverves: boundPairReverves,
    fetchBalancesDone,
    fetchBalancesPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case VAULT_FETCH_BALANCES_BEGIN:
      return {
        ...state,
        fetchBalancesPending: true,
      };

    case VAULT_FETCH_BALANCES_SUCCESS:
      const newAndUpdatedTokens = {};

      Object.entries(action.data).forEach(([symbol, token]) => {
        newAndUpdatedTokens[symbol] = {
          ...state.balances[symbol],
          ...token,
          allowance: {
            ...state.balances[symbol]?.allowance,
            ...token.allowance,
          },
        };
      });

      return {
        ...state,
        balances: {
          ...state.balances,
          ...newAndUpdatedTokens,
        },
        fetchBalancesDone: true,
        fetchBalancesPending: false,
      };

    case VAULT_FETCH_BALANCES_FAILURE:
      return {
        ...state,
        fetchBalancesPending: false,
      };

    default:
      return state;
  }
}
