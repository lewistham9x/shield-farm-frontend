import { useState, useEffect } from "react";
import useFilterStorage from "./useFiltersStorage";

const DEFAULT = "default";
const KEY = "sortedPools";

const useSortedPools = (pools, apys, tokens) => {
  const { getStorage, setStorage } = useFilterStorage();
  const data = getStorage(KEY);

  const [order, setOrder] = useState(data ? data : DEFAULT);

  useEffect(() => {
    setStorage(KEY, order);
  }, [setStorage, order]);

  let sortedPools = pools;
  switch (order) {
    case "apr":
      sortedPools = handleApr(pools, apys);
      break;
    case "tvl":
      sortedPools = handleTvl(pools);
      break;
    case "apr-tvl":
      sortedPools = handleAprTvl(pools, apys);
      break;
    case "tvl-apr":
      sortedPools = handleTvlApr(pools, apys);
      break;
    default:
      break;
  }

  // sortedPools = showDecommissionedFirst(sortedPools, tokens);

  return { sortedPools, order, setOrder };
};

const handleApr = (pools) => {
  const newPools = [...pools];
  newPools.sort((a, b) => (a.apr < b.apr ? 1 : -1));
  return newPools;
};

const handleTvl = (pools) => {
  const newPools = [...pools];
  newPools.sort((a, b) => (a.totalStaked < b.totalStaked ? 1 : -1));
  return newPools;
};

const handleAprTvl = (pools) => {
  const newPools = [...pools];
  newPools.sort(function (a, b) {
    return b.apr - a.apr || b.totalStaked - a.totalStaked;
  });

  console.log(newPools);
  return newPools;
};

const handleTvlApr = (pools) => {
  const newPools = [...pools];
  newPools.sort(function (a, b) {
    return b.totalStaked - a.totalStaked || b.apr - a.apr;
  });
  console.log(newPools);
  return newPools;
};
// function showDecommissionedFirst(pools, tokens) {
//   for (let i = 0; i < pools.length; i++) {
//     // if ( EOL or REFUND ) AND (Deposited Balance > 0)
//     if (
//       (pools[i].status === "eol" || pools[i].status === "refund") &&
//       tokens[pools[i].earnedToken] &&
//       tokens[pools[i].earnedToken].tokenBalance > 0
//     ) {
//       // Remove Vault from pools, insert it at the top.
//       pools.splice(0, 0, pools.splice(i, 1)[0]);
//     }
//   }
//   return pools;
// }

export default useSortedPools;
