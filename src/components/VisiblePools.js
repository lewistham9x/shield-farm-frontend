import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { makeStyles } from "@material-ui/core/styles";

import useFilteredPools from "../hooks/useFilteredPools";
import usePoolsByPlatform from "../hooks/usePoolsByPlatform";
import usePoolsByVaultType from "../hooks/usePoolsByVaultType";
import usePoolsByAsset from "../hooks/usePoolsByAsset";
import useSortedPools from "../hooks/useSortedPools";
import useVisiblePools from "../hooks/useVisiblePools";

import Pool from "./Pool";
import Filters from "./Filters";

const styles = (theme) => ({
  scroller: {
    width: "100%",
  },
  subtitle: {
    fontSize: "20px",
    letterSpacing: "0",
    lineHeight: "8px",
    [theme.breakpoints.down("xs")]: {
      lineHeight: "16px",
    },
    fontWeight: "550",
    color: theme.palette.text.primary,
  },
});

const useStyles = makeStyles(styles);

const VisiblePools = ({ pools }) => {
  console.log("pools", pools);

  const classes = useStyles();
  const { filteredPools, toggleFilter, filters } = useFilteredPools(pools);
  const { poolsByPlatform, platform, setPlatform } =
    usePoolsByPlatform(filteredPools);
  const { poolsByVaultType, vaultType, setVaultType } =
    usePoolsByVaultType(poolsByPlatform);
  const { poolsByAsset, asset, setAsset } = usePoolsByAsset(poolsByVaultType);
  const { sortedPools, order, setOrder } = useSortedPools(
    poolsByAsset
    // apys,
    // tokens
  );
  const { visiblePools, fetchVisiblePools } = useVisiblePools(sortedPools, 10);

  return (
    <>
      <Filters
        toggleFilter={toggleFilter}
        filters={filters}
        platform={platform}
        vaultType={vaultType}
        asset={asset}
        order={order}
        setPlatform={setPlatform}
        setVaultType={setVaultType}
        setAsset={setAsset}
        setOrder={setOrder}
      />
      <div className={classes.scroller}>
        <InfiniteScroll
          dataLength={visiblePools.length}
          hasMore={true}
          next={fetchVisiblePools}
        >
          {visiblePools.map((pool) => (
            <Pool
              pool={pool}
              // tokens={tokens}
              // apy={pool.apr || { totalApy: 0 }}
              key={pool.farm + pool.id}
              // fetchBalancesDone={fetchBalancesDone}
              // fetchApysDone={fetchApysDone}
              // fetchVaultsDataDone={fetchVaultsDataDone}
            />
          ))}
        </InfiniteScroll>
      </div>
      {!sortedPools.length && (
        <h3 className={classes.subtitle}>{"No-Results"}</h3>
      )}
    </>
  );
};

export default VisiblePools;
