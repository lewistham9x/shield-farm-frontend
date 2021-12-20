import React, { memo, useCallback, useEffect, useMemo } from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import InputLabel from "@material-ui/core/InputLabel";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { Avatar, Box, Button } from "@material-ui/core";

const styles = (theme) => ({
  container: {
    padding: "24px",
    margin: "8px 0 2rem",
    border: "1px solid " + theme.palette.background.border,
    backgroundColor: theme.palette.background.primary,
    justifyContent: "space-between",
    position: "relative",
  },

  selectorContainer: {
    width: "100%",
  },

  selectorLabel: {
    color: theme.palette.text.secondary,
    marginBottom: "10px",
  },

  selector: {
    padding: "0",
    margin: "0",
  },

  label: {
    color: theme.palette.text.primary,
    "& .MuiTypography-root": {
      fontSize: "14px",
    },
  },
  boost: {
    color: "#5a8f69",
    fontWeight: "bold",
    "& .MuiAvatar-root": {
      position: "absolute",
      top: 0,
      right: "-20px",
    },
  },
  reset: {
    border: "1px solid " + theme.palette.background.border,
    padding: "4px 8px",
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: theme.palette.background.default,
    "& .MuiButton-label": {
      fontWeight: "bold",
      textTransform: "capitalize",
    },
  },
});

const useStyles = makeStyles(styles);

const Filters = ({
  toggleFilter,
  filters,
  platform,
  chainName,
  asset,
  order,
  setPlatform,
  setChainName,
  setAsset,
  setOrder,
}) => {
  const assets = [];
  const platforms = [];

  const classes = useStyles();

  const handlePlatformChange = useCallback(
    (event) => setPlatform(event.target.value),
    [setPlatform]
  );
  const handleChainNameChange = useCallback(
    (event) => setChainName(event.target.value),
    [setChainName]
  );
  const handleAssetChange = useCallback(
    (_event, option) => setAsset(option.value),
    [setAsset]
  );
  const handleOrderChange = useCallback(
    (event) => setOrder(event.target.value),
    [setOrder]
  );

  const allAssetOptions = useMemo(() => {
    return [
      {
        value: "All",
        label: "Filters",
      },
      ...assets.map((asset) => ({
        value: asset,
        label: asset,
      })),
    ];
  }, []);

  const resetFilter = useCallback(() => {
    toggleFilter("resetAll");
    setPlatform("All");
    setChainName("All");
    setAsset("All");
    setOrder("default");
  }, [toggleFilter, setPlatform, setChainName, setAsset, setOrder]);

  useEffect(() => {
    if (
      (!asset || !allAssetOptions.find((option) => option.value === asset)) &&
      asset !== "All"
    ) {
      setAsset("All");
    }
  }, [allAssetOptions, asset, setAsset]);

  useEffect(() => {
    if ((!platform || !platforms.includes(platform)) && platform !== "All") {
      setPlatform("All");
    }
  }, [platform, setPlatform]);

  return (
    <Grid container spacing={2} className={classes.container}>
      <Grid item xs={6} sm={4} md={3}>
        <Button className={classes.reset} onClick={resetFilter}>
          {"Filters-Reset"}
        </Button>
        <FormControl>
          <FormControlLabel
            className={classes.label}
            control={
              <Checkbox
                checked={filters.hideZeroBalances}
                onChange={() => toggleFilter("hideZeroBalances")}
                color="primary"
              />
            }
            // TODO: translate labels
            label={"Hide-Zero-Balances"}
          />
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <FormControl>
          <FormControlLabel
            className={classes.label}
            control={
              <Checkbox
                checked={!filters.hideDecomissioned}
                onChange={() => toggleFilter("hideDecomissioned")}
                color="primary"
              />
            }
            // TODO: translate labels
            label={"Retired-Vaults"}
          />
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <FormControl>
          <FormControlLabel
            className={classes.label}
            control={
              <Checkbox
                checked={filters.hideZeroVaultBalances}
                onChange={() => toggleFilter("hideZeroVaultBalances")}
                color="primary"
              />
            }
            // TODO: translate labels
            label={"Hide-Zero-Vault-Balances"}
          />
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <FormControl>
          <FormControlLabel
            className={classes.label}
            control={
              <Checkbox
                checked={filters.showBoosted}
                onChange={() => toggleFilter("showBoosted")}
                color="primary"
              />
            }
            // label={
            //   <Box className={classes.boost}>
            //     {t("Boost")}
            //     <Avatar
            //       className={classes.fire}
            //       src={require("images/stake/fire.png")}
            //     />
            //   </Box>
            // }
          />
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <FormControl className={classes.selectorContainer}>
          <InputLabel
            id="select-platform-label"
            className={classes.selectorLabel}
          >
            {"Filters-Platform"}
          </InputLabel>
          <Select
            value={platform}
            onChange={handlePlatformChange}
            className={classes.selector}
            id="select-platform"
            labelId="select-platform-label"
          >
            <MenuItem key={"All"} value={"All"}>
              {"Filters-All"}
            </MenuItem>
            {platforms.map((platform) => (
              <MenuItem key={platform} value={platform}>
                {platform}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <FormControl className={classes.selectorContainer}>
          <InputLabel
            id="select-vault-type-label"
            className={classes.selectorLabel}
          >
            {"Chain"}
          </InputLabel>
          <Select
            value={chainName}
            onChange={handleChainNameChange}
            className={classes.selector}
            id="select-vault-type"
            labelId="select-vault-type-label"
          >
            <MenuItem key={"All"} value={"All"}>
              {"All"}
            </MenuItem>
            <MenuItem key={"BSC"} value={"BSC"}>
              {"Binance Smart Chain"}
            </MenuItem>
            <MenuItem key={"AVAX"} value={"AVAX"}>
              {"Avalanche"}
            </MenuItem>
            <MenuItem key={"MATIC"} value={"MATIC"}>
              {"Polygon"}
            </MenuItem>
            <MenuItem key={"FTM"} value={"FTM"}>
              {"Fantom"}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <FormControl className={classes.selectorContainer}>
          <Autocomplete
            value={allAssetOptions.find((option) => option.value === asset)}
            onChange={handleAssetChange}
            className={classes.selector}
            id="select-asset"
            options={allAssetOptions}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label={"Asset"}
                InputLabelProps={{
                  className: classes.selectorLabel,
                }}
              />
            )}
            disableClearable
          />
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <FormControl className={classes.selectorContainer}>
          <InputLabel id="select-order-label" className={classes.selectorLabel}>
            {"Filters-Sort"}
          </InputLabel>
          <Select
            value={order}
            onChange={handleOrderChange}
            className={classes.selector}
            id="select-order"
            labelId="select-order-label"
          >
            <MenuItem value={"default"}>Default</MenuItem>
            <MenuItem value={"apr"}>APR</MenuItem>
            <MenuItem value={"tvl"}>TVL</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default memo(Filters);
