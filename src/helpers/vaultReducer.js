// import initialState from "./initialState";
import { reducer as fetchBalancesReducer } from "../hooks/fetchBalances";
import { reducer as fetchApprovalReducer } from "../hooks/fetchApproval";
import { reducer as fetchDepositReducer } from "../hooks/fetchDeposit";
import { reducer as fetchWithdrawReducer } from "../hooks/fetchWithdraw";
import { reducer as fetchZapEstimateReducer } from "../hooks/fetchZapEstimate";
import initialState from "./initialState";

const reducers = [
  fetchApprovalReducer,
  fetchDepositReducer,
  fetchWithdrawReducer,
  fetchZapEstimateReducer,
  fetchBalancesReducer,
];

// const initialState = {
//   balances: [],
//   fetchBalancesPending: true,
//   fetchBalancesDone: false,
// };

export default function reducer(state = initialState, action) {
  let newState;

  switch (action.type) {
    // Handle cross-topic actions here
    default:
      newState = state;
      break;
  }
  /* istanbul ignore next */
  return reducers.reduce((s, r) => r(s, action), newState);
}
