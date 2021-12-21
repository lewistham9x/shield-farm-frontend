import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { Helmet } from "react-helmet";
import { hot, setConfig } from "react-hot-loader";
import { HashRouter, Route, Switch } from "react-router-dom";
import {
  makeStyles,
  ThemeProvider,
  StylesProvider,
} from "@material-ui/core/styles";
import appStyle from "./jss/appStyle.js";
import useNightMode from "./hooks/useNightMode";
import createThemeMode from "./jss/appTheme";

// import { useConnectWallet } from "features/home/redux/hooks";
import { useFetchApys } from "./hooks/fetchApys";
import VisiblePools from "./components/VisiblePools";

const FETCH_INTERVAL_MS = 15 * 1000;

const themes = { light: null, dark: null };
const getTheme = (mode) => {
  return (themes[mode] = themes[mode] || createThemeMode(mode === "dark"));
};

function App() {
  const { pools, fetchApys, fetchApysDone } = useFetchApys();
  // const { isNightMode, setNightMode } = useNightMode();
  const isNightMode = false;

  // console.log("apys", pools);
  const theme = useMemo(
    () => getTheme(isNightMode ? "dark" : "light"),
    [isNightMode]
  );

  const useStyles = useMemo(() => {
    return makeStyles(appStyle, { defaultTheme: theme });
  }, [theme]);

  const classes = useStyles();

  useEffect(() => {
    fetchApys();
    const id = setInterval(fetchApys, FETCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchApys]);

  // useEffect(() => {
  //   const fetch = () => {
  //     if (address && web3 && !fetchBalancesPending) {
  //       fetchBalances({ address, web3, tokens });
  //     }
  //     if (!fetchVaultsDataPending) {
  //       fetchVaultsData({ web3, pools });
  //     }
  //   };
  //   fetch();

  //   const id = setInterval(fetch, FETCH_INTERVAL_MS);
  //   return () => clearInterval(id);

  //   // Adding tokens and pools to this dep list, causes an endless loop, DDoSing the api
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [address, web3, fetchBalances, fetchVaultsData]);

  return (
    <HashRouter>
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Grid container className={classes.container}>
            <VisiblePools pools={pools} />
          </Grid>
        </ThemeProvider>
      </StylesProvider>
    </HashRouter>
  );
}

export default hot(module)(App);
