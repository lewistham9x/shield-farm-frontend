import { useState, useEffect } from "react";
import useFilterStorage from "./useFiltersStorage";

const DEFAULT = "All";
const KEY = "poolsByChainName";

const stables = ["BUSD", "USDT", "USDC", "MIM", "DAI"];

const usePoolsByChainName = (pools) => {
  const { getStorage, setStorage } = useFilterStorage();
  const data = getStorage(KEY);

  const [chainName, setChainName] = useState(data ? data : DEFAULT);

  useEffect(() => {
    setStorage(KEY, chainName);
  }, [setStorage, chainName]);

  let newPools = [];

  // if (chainName === "Singles") {
  //   newPools = pools.filter((pool) => pool.assets.length === 1);
  // } else {
  //   const isStable = (vaultType) => stables.includes(vaultType);
  //   if (chainName === "StableLPs") {
  //     newPools = pools.filter((pool) => pool.assets.every(isStable)); // every
  //   } else if (chainName === "Stables") {
  //     newPools = pools.filter((pool) => pool.assets.some(isStable)); // some
  //   }
  // }

  newPools = pools.filter((item) => item.chainName === chainName); // remove duplicate original pool

  let poolsByChainName;
  poolsByChainName = chainName === "All" ? pools : newPools;

  return {
    poolsByChainName,
    chainName,
    setChainName,
  };
};

export default usePoolsByChainName;
