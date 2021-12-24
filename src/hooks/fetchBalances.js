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
  masterChefABI,
} from "../abis";
import { byDecimals } from "../helpers/bignumber";
import { getNetworkMulticall } from "../helpers/getNetworkData";

const CHAIN_TYPES = {
  ETH: {
    ID: 1,
    NAME: "ethereum",
    RPC: "https://speedy-nodes-nyc.moralis.io/59372b342931fb0fa5ffa4da/bsc/mainnet",
    EXPLORER_API: "https://api.bscscan.com/api",
    KEY: process.env.BSCSCAN_API_KEY,
  },
  BSC: {
    ID: 56,
    NAME: "binance",
    RPC: "https://bsc-dataseed.binance.org",
    EXPLORER_API: "https://api.bscscan.com/api",
    KEY: process.env.BSCSCAN_API_KEY,
  },
  AVAX: {
    ID: 43114,
    NAME: "avalanche",
    RPC: "https://api.avax.network/ext/bc/C/rpc",
    EXPLORER_API: "https://api.snowtrace.io/api",
    KEY: process.env.AVAXSCAN_API_KEY,
  },

  MATIC: {
    ID: 137,
    NAME: "polygon",
    RPC: "https://polygon-rpc.com",
    EXPLORER_API: "https://api.polygonscan.com/api",
    KEY: process.env.MATICSCAN_API_KEY,
  },
  FTM: {
    ID: 250,
    NAME: "fantom",
    RPC: "https://rpc.ftm.tools",
    EXPLORER_API: "https://api.ftmscan.com/api",
    KEY: process.env.FTMSCAN_API_KEY,
  },
  CRO: {
    ID: 25,
    NAME: "cronos",
    RPC: "https://evm-cronos.crypto.org/",
    EXPLORER_API: "https://api.ftmscan.com/api",
    KEY: process.env.CROSCAN_API_KEY,
  },
};

export function fetchBalances({ address, web3, balances, pools }) {
  return (dispatch) => {
    if (!(address && web3)) return;

    dispatch({
      type: VAULT_FETCH_BALANCES_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const multicall = new MultiCall(
        web3,
        "0xC3821F0b56FA4F4794d5d760f94B812DE261361B"
      );
      // temp hardcode
      // const multicall = new MultiCall(web3, getNetworkMulticall());

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

      Object.entries(pools).forEach(([lpid, launchpool]) => {
        if (launchpool.masterChef) {
          const multicallContract = new web3.eth.Contract(
            masterChefABI,
            launchpool.masterChef
          );

          multicallContract.setProvider(CHAIN_TYPES[launchpool.chainName].RPC);

          launchPoolBalanceCalls.push({
            balance: multicallContract.methods.userInfo(launchpool.id, address),
            symbol: launchpool.lpToken.symbol,
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

            console.log("allowanceResults", allowanceResults);

            launchpoolBalanceResults.forEach((launchPoolBalanceResult) => {
              const previousBalance =
                newTokens[launchPoolBalanceResult.symbol]
                  ?.launchpoolTokenBalance || 0;

              const newBalance = launchPoolBalanceResult.balance || [0];
              const amount = newBalance[0];
              // divide by decimals
              const amountInDecimals = byDecimals(
                amount || 0,
                balances[launchPoolBalanceResult.symbol].decimals
              );

              newTokens[launchPoolBalanceResult.symbol] = {
                ...newTokens[launchPoolBalanceResult.symbol],
                launchpoolTokenBalance: new BigNumber.sum(
                  amountInDecimals,
                  previousBalance
                ).toString(),
              };

              console.log("amount:", amountInDecimals);
            });

            dispatch({
              type: VAULT_FETCH_BALANCES_SUCCESS,
              data: newTokens,
            });
            resolve();
          }
        )
        .catch((error) => {
          console.log("Error", error);
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
