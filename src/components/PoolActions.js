import React from "react";
import Grid from "@material-ui/core/Grid";

import DepositSection from "./PoolDetails/DepositSection/DepositSection";
import WithdrawSection from "./PoolDetails/WithdrawSection/WithdrawSection";
import HarvestSection from "./PoolDetails/HarvestSection/HarvestSection";
import { NetworkRequired } from "./NetworkRequired/NetworkRequired";

const PoolActions = ({ pool, balanceSingle, index, sharesBalance }) => {
  return (
    <NetworkRequired inline>
      <Grid container>
        <DepositSection
          index={index}
          pool={pool}
          balanceSingle={balanceSingle}
        />
        <WithdrawSection
          index={index}
          pool={pool}
          sharesBalance={sharesBalance}
        />
        {pool.farm ? "" : <HarvestSection index={index} pool={pool} />}
      </Grid>
    </NetworkRequired>
  );
};

export default PoolActions;
