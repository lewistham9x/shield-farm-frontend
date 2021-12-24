import React, {
  memo,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { SnackbarProvider } from "notistack";

import { useFetchApys } from "./hooks/fetchApys";
import { useFetchBalances } from "./hooks/fetchBalances";

import VisiblePools from "./components/VisiblePools";
import { useConnectWallet, useDisconnectWallet } from "./hooks/hooks";
import { renderIcon } from "@download/blockies";
import { createWeb3Modal } from "./web3";

import Button from "./components/Button";
import Avatar from "@material-ui/core/Avatar";
import { VAULT_FETCH_BALANCES_SUCCESS } from "./helpers/constants.js";
import { useDispatch } from "react-redux";

const FETCH_INTERVAL_MS = 15 * 1000;

const themes = { light: null, dark: null };
const getTheme = (mode) => {
  return (themes[mode] = themes[mode] || createThemeMode(mode === "dark"));
};

function App() {
  const { pools, fetchApys, fetchApysDone } = useFetchApys();
  const { balances, fetchBalances, fetchBalancesPending, fetchBalancesDone } =
    useFetchBalances();
  const { connectWallet, web3, address, networkId, connected } =
    useConnectWallet();
  const { disconnectWallet } = useDisconnectWallet();
  const [web3Modal, setModal] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);

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

  const [shortAddress, setShortAddress] = useState("");
  const [dataUrl, setDataUrl] = useState(null);

  const canvasRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!connected) {
      return;
    }

    const canvas = canvasRef.current;
    renderIcon({ seed: address.toLowerCase() }, canvas);
    const updatedDataUrl = canvas.toDataURL();
    if (updatedDataUrl !== dataUrl) {
      setDataUrl(updatedDataUrl);
    }
    if (address.length < 11) {
      setShortAddress(address);
    } else {
      setShortAddress(`${address.slice(0, 6)}...${address.slice(-4)}`);
    }
  }, [dataUrl, address, connected]);

  useEffect(() => {
    setModal(createWeb3Modal());
  }, [setModal]);

  useEffect(() => {
    if (web3Modal && (web3Modal.cachedProvider || window.ethereum)) {
      connectWallet(web3Modal);
    }
  }, [web3Modal, connectWallet]);

  const connectWalletCallback = useCallback(() => {
    connectWallet(web3Modal);
  }, [web3Modal, connectWallet]);

  const disconnectWalletCallback = useCallback(() => {
    disconnectWallet(web3, web3Modal);
  }, [web3, web3Modal, disconnectWallet]);

  useEffect(() => {
    fetchApys();
    const id = setInterval(fetchApys, FETCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchApys]);

  useEffect(() => {
    const fetch = () => {
      if (address && web3 && !fetchBalancesPending) {
        fetchBalances({ address, web3, balances, pools });
      }
      // if (!fetchVaultsDataPending) {
      //   fetchVaultsData({ web3, pools });
      // }
    };
    fetch();

    const id = setInterval(fetch, FETCH_INTERVAL_MS);
    return () => clearInterval(id);

    // Adding tokens and pools to this dep list, causes an endless loop, DDoSing the api
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, web3, fetchBalances]);

  // retrieve all token in pool and dispatch them to the store
  useEffect(() => {
    if (pools.length > 0 && firstLoad) {
      setFirstLoad(false);
      var balances = {};
      console.log("Loading again");

      pools.forEach(
        (
          {
            lpToken,
            masterChef,
            rewardToken,
            withdrawalFee = 0,
            depositFee = 0,
          },
          i
        ) => {
          const token = lpToken.symbol;
          const tokenDecimals = lpToken.decimals;
          const tokenAddress = lpToken.contract;
          const earnedToken = rewardToken.symbol;
          const earnContractAddress = masterChef;
          const earnedTokenAddress = rewardToken.contract;

          if (!withdrawalFee) pools[i].withdrawalFee = "0.1%";
          if (!depositFee) pools[i].depositFee = "0%";

          balances[token] = {
            symbol: token,
            decimals: tokenDecimals,
            tokenAddress: tokenAddress,
            tokenBalance: 0,
            allowance: {
              ...balances[token]?.allowance,
              [earnContractAddress]: tokenAddress ? 0 : Infinity,
            },
            chainName: lpToken.chainName,
          };
          balances[earnedToken] = {
            symbol: earnedToken,
            decimals: 18,
            tokenAddress: earnedTokenAddress,
            tokenBalance: 0,
            allowance: {
              [earnContractAddress]: 0,
            },
            chainName: rewardToken.chainName,
          };
        }
      );
      dispatch({ type: VAULT_FETCH_BALANCES_SUCCESS, data: balances });
    }
  }, [pools]);

  return (
    <HashRouter>
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <Button
              disableElevation
              className={classes.walletDisplay}
              onClick={
                connected ? disconnectWalletCallback : connectWalletCallback
              }
            >
              {connected ? (
                <>
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <Avatar
                    alt="address"
                    src={dataUrl}
                    style={{
                      width: "24px",
                      height: "24px",
                      marginRight: "4px",
                    }}
                  />
                  {shortAddress}
                </>
              ) : (
                <>
                  <i className={classes.icon + " far fa-question-circle"} />
                  {"Connect to Wallet"}
                </>
              )}
            </Button>

            <Grid container className={classes.container}>
              <VisiblePools pools={pools} balances={balances} />
            </Grid>
          </SnackbarProvider>
        </ThemeProvider>
      </StylesProvider>
    </HashRouter>
  );
}

export default hot(module)(App);
