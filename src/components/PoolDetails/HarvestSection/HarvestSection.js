import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";

import Button from "../../Button.js";
import { useFetchHarvest } from "../../../hooks/hooks";
import { useConnectWallet } from "../../../hooks/hooks";
import styles from "./styles";

const useStyles = makeStyles(styles);

const HarvestSection = ({ pool, index }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { web3, address } = useConnectWallet();
  const { enqueueSnackbar } = useSnackbar();
  const { fetchHarvest, fetchHarvestPending } = useFetchHarvest();
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  const onHarvest = () => {
    fetchHarvest({
      address,
      web3,
      contractAddress: pool.earnContractAddress,
      index,
    })
      .then(() =>
        enqueueSnackbar(t("Vault-HarvestSuccess"), { variant: "success" })
      )
      .catch((error) =>
        enqueueSnackbar(t("Vault-HarvestError", { error }), {
          variant: "error",
        })
      );
    setShowHarvestModal(false);
  };

  return (
    <>
      <Dialog
        open={showHarvestModal}
        onClose={() => setShowHarvestModal(false)}
      >
        <DialogTitle>
          <Typography className={classes.title} variant="body2">
            {t("Vault-HarvestConfirm")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography className={classes.subtitle} variant="body2">
              {t("Vault-HarvestDescription")}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            className={`${classes.showDetailButton} ${classes.showDetailButtonOutlined} `}
            color="primary"
            onClick={() => setShowHarvestModal(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            className={`${classes.showDetailButton} ${classes.showDetailButtonContained} `}
            onClick={() => onHarvest()}
          >
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
      <Grid item xs={12} md={2} className={classes.sliderDetailContainer}>
        <div className={classes.showDetailBottom}>
          <div className={classes.showDetailLeft}>
            {/* {t('Vault-LastHarvest')}: */}
          </div>
          <div style={{ textAlign: "center" }}>
            <Button
              className={`${classes.showDetailButton} ${classes.showDetailButtonOutlined} ${classes.showResponsiveButtonCon}`}
              style={{
                marginBottom: pool.platform === "Autofarm" ? "48px" : "12px",
              }}
              type="button"
              color="primary"
              onClick={() => setShowHarvestModal(true)}
            >
              {fetchHarvestPending[index]
                ? `${t("Vault-Harvesting")}`
                : `${t("Vault-HarvestButton")}`}
            </Button>
          </div>
        </div>
      </Grid>
    </>
  );
};

export default HarvestSection;
