import React, { memo, useCallback, useEffect, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import BigNumber from "bignumber.js";
import PoolSummary from "./PoolSummary";

import { byDecimals } from "../helpers/bignumber";
import { useSelector } from "react-redux";
// import PoolActions from "../PoolActions/PoolActions";
import AccordionDetails from "@material-ui/core/AccordionActions";
// import { useLaunchpoolSubscriptions } from "../../../stake/redux/hooks";

const styles = (theme) => ({
  container: {
    marginBottom: "24px",
    border: "1px solid " + theme.palette.background.border,
  },
  accordion: {
    width: "100%",
    backgroundColor: theme.palette.background.primary,
  },
  divider: {
    margin: "0 30px",
  },
});

const useStyles = makeStyles(styles);

const Pool = ({
  pool,
  // key,
  // tokens,
  // apy,
  // fetchBalancesDone,
  // fetchApysDone,
  // fetchVaultsDataDone,
}) => {
  const classes = useStyles();

  const [isOpen, setIsOpen] = useState(false);
  const toggleCard = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  // const { subscribe } = useLaunchpoolSubscriptions();
  // const balanceSingle = byDecimals(
  //   tokens[pool.token].tokenBalance,
  //   pool.tokenDecimals
  // );
  // const sharesBalance = tokens[pool.earnedToken].launchpoolTokenBalance
  //   ? new BigNumber.sum(
  //       tokens[pool.earnedToken].launchpoolTokenBalance,
  //       tokens[pool.earnedToken].tokenBalance
  //     )
  //   : new BigNumber(tokens[pool.earnedToken].tokenBalance);
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
          pool={pool}
          toggleCard={toggleCard}
          // multipleLaunchpools={multipleLaunchpools}
        />
        <Divider variant="middle" className={classes.divider} />
        <AccordionDetails style={{ justifyContent: "space-between" }}>
          {/* <PoolActions
            pool={pool}
            balanceSingle={balanceSingle}
            sharesBalance={sharesBalance}
          /> */}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default memo(Pool);
