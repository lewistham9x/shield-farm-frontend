import { useState, useEffect } from "react";
import useFilterStorage from "./useFiltersStorage";

const DEFAULT = "All";
const KEY = "poolsByAsset";

const usePoolsByAsset = (pools) => {
  const { getStorage, setStorage } = useFilterStorage();
  const data = getStorage(KEY);

  const [asset, setAsset] = useState(data ? data : DEFAULT);

  useEffect(() => {
    setStorage(KEY, asset);
  }, [setStorage, asset]);

  let newPools = [];

  // console.log("pools", pools);
  newPools = pools.filter((item) =>
    item.name.toUpperCase().includes(asset.toUpperCase())
  );

  // console.log("newPools", newPools);

  let poolsByAsset;
  poolsByAsset = asset === "" ? pools : newPools;

  return { poolsByAsset, asset, setAsset };
};

export default usePoolsByAsset;
