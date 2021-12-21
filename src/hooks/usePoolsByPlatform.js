import { useState, useEffect } from "react";
import useFilterStorage from "./useFiltersStorage";

const DEFAULT = "All";
const KEY = "poolsByPlatform";

const usePoolsByPlatform = (pools) => {
  const { getStorage, setStorage } = useFilterStorage();
  const data = getStorage(KEY);

  const [platform, setPlatform] = useState(data ? data : DEFAULT);

  useEffect(() => {
    setStorage(KEY, platform);
  }, [setStorage, platform]);

  let newPools = [];

  newPools = pools.filter(
    (item) =>
      item.farm.toLowerCase().includes(platform.toLowerCase()) ||
      item.name.toLowerCase().includes(platform.toLowerCase())
  );

  let poolsByPlatform;
  poolsByPlatform = platform === "All" ? pools : newPools;

  return { poolsByPlatform, platform, setPlatform };
};

export default usePoolsByPlatform;
