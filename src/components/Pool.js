import React, { memo, useCallback, useEffect, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import BigNumber from "bignumber.js";
import PoolSummary from "./PoolSummary";

import { byDecimals } from "../helpers/bignumber";
import { useSelector } from "react-redux";
import PoolActions from "./PoolActions";
import AccordionDetails from "@material-ui/core/AccordionActions";
// import { useLaunchpoolSubscriptions } from "../../../stake/redux/hooks";

const styles = (theme) => ({
  container: {
    marginBottom: "24px",
    border: "1px solid " + theme.palette.background.border,
    borderRadius: "5px",
  },
  accordion: {
    width: "100%",
    backgroundColor: theme.palette.background.primary,
    borderRadius: "5px",
  },
  divider: {
    margin: "0 30px",
  },
});

const useStyles = makeStyles(styles);

const Pool = ({
  pools,
  pool,
  balances,
  // apy,
  fetchBalancesDone,
  fetchApysDone,
  updatePool,
  loadingPools,
  addLoadingPool,
  removeLoadingPool,
  // fetchVaultsDataDone,
}) => {
  const classes = useStyles();

  const [isOpen, setIsOpen] = useState(false);
  const toggleCard = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  // const { subscribe } = useLaunchpoolSubscriptions();

  var sharesBalance = new BigNumber(0); //how much user can withdraw
  var balanceSingle = new BigNumber(0); //how much user can deposit

  if (balances[pool.lpToken.symbol]) {
    balanceSingle = byDecimals(
      balances[pool.lpToken.symbol].tokenBalance,
      pool.lpToken.decimals
    );
  }

  // console.log("balances", balances);
  // console.log("pool.rewardsymbol", pool.rewardToken.symbol);
  // console.log(
  //   "pool.rewardsymbol balancew",
  //   balances[pool.rewardToken.symbol].launchpoolTokenBalance
  // );

  if (balances[pool.rewardToken.symbol]) {
    sharesBalance = balances[pool.rewardToken.symbol].launchpoolTokenBalance
      ? new BigNumber.sum(
          balances[pool.rewardToken.symbol].launchpoolTokenBalance,
          balances[pool.rewardToken.symbol].tokenBalance
        )
      : new BigNumber(balances[pool.rewardToken.symbol].tokenBalance);

    console.log("sharesBalance", sharesBalance * 1);
    console.log(pool.pricePerFullShare);
    console.log(pool.rewardToken.decimals);
  }

  // const launchpoolId = useSelector(
  //   (state) => state.vault.vaultLaunchpool[pool.id]
  // );
  // const launchpool = launchpoolId ? launchpools[launchpoolId] : null;
  // const activeLaunchpools = useSelector(
  //   (state) => state.vault.vaultLaunchpools[pool.id]
  // );
  // const multipleLaunchpools = activeLaunchpools.length > 1;

  // useEffect(() => {
  //   const unsubscribes = activeLaunchpools.map((launchpoolId) =>
  //     subscribe(launchpoolId, {
  //       poolApr: true,
  //       poolFinish: true,
  //     })
  //   );

  //   return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  // }, [subscribe, activeLaunchpools]);

  return (
    <Grid
      item
      xs={12}
      container
      // key={key}
      className={classes.container}
      spacing={0}
    >
      <Accordion
        expanded={isOpen}
        className={classes.accordion}
        square={true}
        TransitionProps={{ unmountOnExit: true }}
      >
        <PoolSummary
          pools={pools}
          pool={pool}
          toggleCard={toggleCard}
          updatePool={updatePool}
          loadingPools={loadingPools}
          addLoadingPool={addLoadingPool}
          removeLoadingPool={removeLoadingPool}
          fetchBalancesDone={fetchBalancesDone}
          balanceSingle={balanceSingle}
          sharesBalance={sharesBalance}
          // fetchApysDone={fetchApysDone}
          // multipleLaunchpools={multipleLaunchpools}
        />
        <Divider variant="middle" className={classes.divider} />
        <AccordionDetails style={{ justifyContent: "space-between" }}>
          <PoolActions
            pool={pool}
            balanceSingle={balanceSingle}
            sharesBalance={sharesBalance}
          />
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default memo(Pool);
