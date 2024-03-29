import React, { useCallback, useMemo, useState, useEffect } from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Refresh from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import { useTranslation } from "react-i18next";
import BigNumber from "bignumber.js";
import makeStyles from "@mui/styles/makeStyles";
import { formatTvl } from "../helpers/format";
import { byDecimals } from "../helpers/bignumber";
// import styles from "./styles";
// import PoolPaused from "./PoolPaused/PoolPaused";
import PoolTitle from "./PoolTitle";
import LabeledStat from "./LabeledStat";
import ApyStats from "./ApyStats";
// import { usePoolApr } from "../../../stake/redux/subscription";
// import { PoolBoosts } from "./PoolBoosts/PoolBoosts";
// import { getRetireReason } from "./RetireReason/RetireReason";
// import { getPoolWarning } from "./PoolWarning/PoolWarning";

import useStorage from "../hooks/useStorage";
import { Button } from "@mui/material";

const styles = (theme) => ({
  details: {
    display: "flex",
    alignItems: "center",
    background: theme.palette.background.primary,
    borderRadius: "5px",
  },
  detailsPaused: {
    display: "flex",
    alignItems: "center",
    background: theme.palette.background.paused,
  },
  detailsRetired: {
    display: "flex",
    alignItems: "center",
    background: theme.palette.background.retired,
  },
  mobilePadding: {
    paddingTop: "20px",
    [theme.breakpoints.up("sm")]: {
      paddingTop: 0,
    },
  },
  item: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    [theme.breakpoints.up("sm")]: {
      flexBasis: "40%",
      maxWidth: "40%",
    },
    [theme.breakpoints.up("md")]: {
      flexBasis: "27%",
      maxWidth: "27%",
    },
    [theme.breakpoints.up("lg")]: {
      flexBasis: "20%",
      maxWidth: "20%",
    },
  },
  itemBalances: {
    [theme.breakpoints.up("sm")]: {
      flexBasis: "25%",
      maxWidth: "25%",
    },
    [theme.breakpoints.up("md")]: {
      flexBasis: "15%",
      maxWidth: "15%",
    },
    [theme.breakpoints.up("lg")]: {
      flexBasis: "18%",
      maxWidth: "18%",
    },
  },
  itemStats: {
    [theme.breakpoints.up("md")]: {
      flexBasis: "11%",
      maxWidth: "11%",
    },
    [theme.breakpoints.up("lg")]: {
      flexBasis: "11.33%",
      maxWidth: "11.33%",
    },
  },
  itemInner: {
    textAlign: "center",
  },
  refresh: {
    [theme.breakpoints.up("sm")]: {
      flexBasis: "10%",
      maxWidth: "10%",
    },
    [theme.breakpoints.up("md")]: {
      flexBasis: "10%",
      maxWidth: "10%",
    },
    [theme.breakpoints.up("lg")]: {
      flexBasis: "10%",
      maxWidth: "10%",
    },
  },
});

const useStyles = makeStyles(styles);

const PoolSummary = ({
  pools,
  pool,
  // launchpool,
  toggleCard,
  balanceSingle,
  sharesBalance,
  // apy,
  fetchBalancesDone,
  updatePool,
  loadingPools,
  addLoadingPool,
  removeLoadingPool,
  // fetchApysDone,
  // fetchVaultsDataDone,
  // multipleLaunchpools = false,
}) => {
  const classes = useStyles();

  // const launchpoolApr = usePoolApr(launchpool ? launchpool.id : null);
  // const vaultStateTitle = useMemo(() => {
  //   let state =
  //     pool.status === "eol"
  //       ? t(getRetireReason(pool.retireReason))
  //       : pool.depositsPaused
  //       ? t("Vault-DepositsPausedTitle")
  //       : pool.showWarning
  //       ? t(getPoolWarning(pool.warning), {
  //           name: pool.name,
  //           platform: pool.platform,
  //         })
  //       : null;

  //   if (launchpool) {
  //     state = t("Stake-BoostedBy", { name: launchpool.name });
  //   }

  //   if (pool.experimental) {
  //     state = t("Vault-Experimental");
  //   }

  //   return state === null ? (
  //     ""
  //   ) : (
  //     <PoolPaused
  //       message={t(state)}
  //       isBoosted={!!launchpool}
  //       isExperimental={!!pool.experimental}
  //     />
  //   );
  // }, [pool, launchpool, t]);

  const balanceUsd =
    balanceSingle > 0 && fetchBalancesDone
      ? formatTvl(balanceSingle, pool.oraclePrice)
      : "";
  // console.log("shareBalance", sharesBalance);

  const deposited = byDecimals(
    sharesBalance.multipliedBy(new BigNumber(pool.pricePerFullShare)),
    pool.rewardToken.decimals
  );
  const depositedUsd =
    deposited > 0 && fetchBalancesDone
      ? formatTvl(deposited, pool.oraclePrice)
      : "";

  const onRefreshClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updatePool({ pool: pool, pools: pools }, addLoadingPool, removeLoadingPool);
  };

  const onSummaryClick = useCallback(
    (e) => {
      if (!e.target || !e.target.classList.contains("tooltip-toggle")) {
        // toggleCard(); temporarily disabled until feature is created
      }
    },
    [toggleCard]
  );

  return (
    <AccordionSummary
      className={
        pool.status === "eol"
          ? classes.detailsRetired
          : pool.depositsPaused
          ? classes.detailsPaused
          : classes.details
      }
      style={{ justifyContent: "space-between" }}
      onClick={onSummaryClick}
    >
      <Grid container alignItems="center" style={{ paddingTop: "20px" }}>
        <Grid item xs={12} className={`${classes.item} ${classes.itemTitle}`}>
          <PoolTitle
            // name={pool.name}
            // logo={pool.logo}
            // poolId={pool.farm + pool.id}
            description={pool.farm}
            chainName={pool.chainName}
            // launchpool={launchpool}
            // addLiquidityUrl={pool.addLiquidityUrl}
            // removeLiquidityUrl={pool.removeLiquidityUrl}
            // buyTokenUrl={pool.buyTokenUrl}
            // assets={pool.assets}
            // multipleLaunchpools={multipleLaunchpools}
            name={pool.name}
            created={pool.date_created}
            // launchpool={pool.farm}
          />
        </Grid>
        <Grid item xs={6} className={`${classes.item} ${classes.itemBalances}`}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => window.open(pool.website, "_blank")}
          >
            Website
          </Button>
        </Grid>
        {/* <Grid item xs={6} className={`${classes.item} ${classes.itemBalances}`}> */}
        {/* <LabeledStat
            value={formatDecimals(balanceSingle)}
            subvalue={balanceUsd}
            label={"Wallet"}
            // isLoading={!fetchBalancesDone}
            className={classes.itemInner}
          /> */}
        {/* </Grid> */}
        <Grid item xs={6} className={`${classes.item} ${classes.itemBalances}`}>
          {/* <LabeledStat
            value={formatDecimals(deposited)}
            subvalue={depositedUsd}
            label={"Deposited"}
            // isLoading={!fetchBalancesDone}
            className={classes.itemInner}
          /> */}
        </Grid>
        <ApyStats
          apy={{ totalApy: pool.apr / 100 }}
          // launchpoolApr={launchpoolApr}
          isLoading={
            loadingPools.filter(
              (e) => e.name === pool.name && e.farm === pool.farm
            ).length > 0
          }
          itemClasses={`${classes.item} ${classes.itemStats}`}
          itemInnerClasses={classes.itemInner}
        />
        <Grid item xs={4} className={`${classes.item} ${classes.itemStats}`}>
          <LabeledStat
            value={formatTvl(pool.totalStaked)}
            label={"TVL"}
            isLoading={
              loadingPools.filter(
                (e) => e.name === pool.name && e.farm === pool.farm
              ).length > 0
            }
            className={classes.itemInner}
          />
        </Grid>
        <Grid item xs={4} className={`${classes.item} ${classes.refresh}`}>
          <IconButton
            label="Update"
            className={classes.itemInner}
            onClick={onRefreshClick}
            size="large"
          >
            <Refresh />
          </IconButton>
        </Grid>
      </Grid>
    </AccordionSummary>
  );
};

const formatDecimals = (number) => {
  return number >= 10 ? number.toFixed(4) : number == 0 ? 0 : number.toFixed(8);
};

export default PoolSummary;
