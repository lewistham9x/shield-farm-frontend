import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { makeStyles } from "@material-ui/core/styles";

import useFilteredPools from "../hooks/useFilteredPools";
import usePoolsByPlatform from "../hooks/usePoolsByPlatform";
import usePoolsByChainName from "../hooks/usePoolsByChainName";
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
  const classes = useStyles();
  const { filteredPools, toggleFilter, filters } = useFilteredPools(pools);
  const { poolsByPlatform, platform, setPlatform } =
    usePoolsByPlatform(filteredPools);
  const { poolsByChainName, chainName, setChainName } =
    usePoolsByChainName(poolsByPlatform);
  const { poolsByAsset, asset, setAsset } = usePoolsByAsset(poolsByChainName);
  const { sortedPools, order, setOrder } = useSortedPools(poolsByChainName); //switch back here to poolsByAsset if need be

  var { visiblePools, fetchVisiblePools } = useVisiblePools(sortedPools, 10);

  return (
    <>
      <Filters
        toggleFilter={toggleFilter}
        filters={filters}
        platform={platform}
        chainName={chainName}
        asset={asset}
        order={order}
        setPlatform={setPlatform}
        setChainName={setChainName}
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
        <h3 className={classes.subtitle}>{"No Results"}</h3>
      )}
    </>
  );
};

export default VisiblePools;
