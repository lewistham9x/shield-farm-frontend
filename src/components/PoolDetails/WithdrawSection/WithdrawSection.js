/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useMemo, useEffect } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import Grid from "@material-ui/core/Grid";
import BigNumber from "bignumber.js";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";

import Button from "../../Button.js";
import CustomOutlinedInput from "../../CustomOutlinedInput/CustomOutlinedInput";
import CustomSlider from "../../CustomSlider/CustomSlider";
import RefundButtons from "../RefundButtons/RefundButtons";
import {
  byDecimals,
  convertAmountToRawNumber,
  convertAmountFromRawNumber,
} from "../../../helpers/bignumber";
import { shouldHideFromHarvest } from "../../../helpers/utils";
import {
  useFetchWithdraw,
  useFetchBalances,
  useFetchApproval,
  useFetchZapEstimate,
} from "../../../hooks/hooks";
import { useConnectWallet } from "../../../hooks/hooks";
// import { getNetworkCoin } from "features/helpers/getNetworkData";

import styles from "./styles";

// to fix
const getNetworkCoin = (network) => {};

const useStyles = makeStyles(styles);
const nativeCoin = getNetworkCoin();

const WithdrawSection = ({ pool, index, sharesBalance }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { web3, address } = useConnectWallet();

  const { enqueueSnackbar } = useSnackbar();
  const { fetchApproval, fetchApprovalPending } = useFetchApproval();
  const {
    fetchWithdraw,
    fetchWithdrawBnb,
    fetchZapWithdrawAndRemoveLiquidity,
    fetchZapWithdrawAndSwap,
    fetchWithdrawPending,
  } = useFetchWithdraw();
  const { fetchZapWithdrawEstimate, fetchZapEstimatePending } =
    useFetchZapEstimate();
  const { balances, fetchBalances, fetchPairReverves } = useFetchBalances();

  const sharesDecimals = pool.rewardToken.decimals;
  const sharesByDecimals = byDecimals(sharesBalance, sharesDecimals);

  const underlyingBalance = sharesByDecimals
    .multipliedBy(pool.pricePerFullShare)
    .decimalPlaces(pool.rewardToken.decimals, BigNumber.ROUND_DOWN);

  const withdrawOutputs = useMemo(() => {
    const outputs = [
      {
        name: pool.name,
        symbol: pool.lpToken.symbol,
        address: pool.lpToken.contract,
        decimals: pool.lpToken.decimals,
        logoURI: pool.logo,
      },
    ];

    if (pool.zap) {
      const pairTokens = pool.zap.tokens.filter(
        (t) => t.symbol !== nativeCoin.wrappedSymbol
      );
      if (pairTokens.length) {
        outputs.push(
          {
            symbol: pool.assets.join("+"),
          },
          ...pairTokens
        );
      }
    }

    return outputs;
  }, [
    pool.logo,
    pool.name,
    pool.lpToken.symbol,
    pool.lpToken.contract,
    pool.lpToken.decimals,
    pool.zap,
  ]);

  const [withdrawSettings, setWithdrawSettings] = useState({
    isZap: false,
    isSwap: false,
    swapInput: undefined,
    swapOutput: undefined,
    outputIndex: 0,
    amount: new BigNumber(0),
    slider: 0,
    input: "0.0",
    vaultAddress: pool.earnContractAddress,
    withdrawAddress: pool.earnContractAddress,
    isNeedApproval: false,
    slippageTolerance: 0.01,
    swapAmountOut: pool.zapWithdrawEstimate?.swapAmountOut,
  });

  useDeepCompareEffect(() => {
    if (fetchWithdrawPending[index]) return;
    if (fetchZapEstimatePending[pool.tokenAddress]) return;
    if (pool.zap) {
      fetchPairReverves({ web3, pairToken: balances[pool.lpToken.symbol] });
    }
  }, [pool, new Date().getMinutes()]);

  useDeepCompareEffect(() => {
    if (fetchWithdrawPending[index]) return;
    if (fetchZapEstimatePending[pool.tokenAddress]) return;
    if (pool.zap && withdrawSettings.isSwap) {
      fetchZapWithdrawEstimate({
        web3,
        vaultAddress: pool.earnContractAddress,
        routerAddress: pool.zap.ammRouter,
        swapInput: withdrawSettings.swapInput,
        swapOutput: withdrawSettings.swapOutput,
        pairToken: balances[pool.lpToken.symbol],
        pairTokenAmount: convertAmountToRawNumber(
          withdrawSettings.amount,
          balances[pool.lpToken.symbol].decimals
        ),
      });
    }
  }, [
    balances[pool.lpToken.symbol].reserves,
    withdrawSettings.amount,
    withdrawSettings.outputIndex,
  ]);

  const handleOutputChange = (event) => {
    const outputIndex = event.target.value;
    const isZap = outputIndex > 0;
    const isSwap = outputIndex > 1;
    const spender = isZap ? pool.zap.zapAddress : pool.earnContractAddress;
    const swapInput = isSwap
      ? withdrawOutputs[outputIndex === 2 ? 3 : 2]
      : undefined;
    const swapOutput = isSwap ? withdrawOutputs[outputIndex] : undefined;
    const allowance = new BigNumber(
      balances[pool.rewardToken.symbol].allowance[spender]
    );

    setWithdrawSettings((prevState) => ({
      ...prevState,
      outputIndex,
      isZap,
      isSwap,
      swapInput,
      swapOutput,
      withdrawAddress: spender,
      isNeedApproval: isZap && allowance.isZero(),
    }));
  };

  const handleSliderChange = (_, sliderInt) => {
    setWithdrawSettings((prevState) => ({
      ...prevState,
      slider: sliderInt,
    }));
  };

  const handleSliderChangeCommitted = (_, sliderInt) => {
    let amount = new BigNumber(0);
    let input = new BigNumber(0);
    if (sliderInt > 0 && sliderInt < 99) {
      amount = underlyingBalance
        .times(sliderInt)
        .div(100)
        .decimalPlaces(pool.rewardToken.decimals, BigNumber.ROUND_DOWN);
      input = amount.decimalPlaces(8, BigNumber.ROUND_DOWN).toFormat();
    }
    if (sliderInt >= 99) {
      amount = underlyingBalance;
      sliderInt = 100;
      input = amount.toFormat();
    }

    setWithdrawSettings((prevState) => ({
      ...prevState,
      amount: amount,
      slider: sliderInt,
      input: input,
    }));
  };

  const handleMax = (_) => {
    handleSliderChangeCommitted(_, 100);
  };

  const handleInputAmountChange = (event) => {
    const input = event.target.value
      .replace(/[,]+/, "")
      .replace(/[^0-9.]+/, "");
    let amount = new BigNumber(input);

    if (amount.isNaN()) amount = new BigNumber(0);
    if (amount.isGreaterThan(underlyingBalance)) amount = underlyingBalance;

    const sliderInt = underlyingBalance.isZero()
      ? 0
      : amount.times(100).dividedToIntegerBy(underlyingBalance).toNumber();

    setWithdrawSettings((prevState) => ({
      ...prevState,
      amount: amount,
      slider: sliderInt,
      input: amount.isEqualTo(input) ? input : amount.toFormat(),
    }));
  };

  useEffect(() => {
    const allowance = new BigNumber(
      balances[pool.rewardToken.symbol].allowance[
        withdrawSettings.withdrawAddress
      ]
    );
    setWithdrawSettings((prevState) => ({
      ...prevState,
      isNeedApproval: prevState.isZap && allowance.isZero(),
    }));
  }, [pool.rewardToken.symbol, balances, withdrawSettings.withdrawAddress]);

  const handleApproval = () => {
    fetchApproval({
      address,
      web3,
      tokenAddress: pool.rewardToken.contract,
      contractAddress: pool.zap.zapAddress,
      tokenSymbol: pool.rewardToken.symbol,
    })
      .then(() =>
        enqueueSnackbar(t("Vault-ApprovalSuccess"), { variant: "success" })
      )
      .catch((error) =>
        enqueueSnackbar(t("Vault-ApprovalError", { error }), {
          variant: "error",
        })
      );
  };

  const handleWithdraw = () => {
    const sharesAmount = withdrawSettings.amount
      .dividedBy(pool.pricePerFullShare)
      .decimalPlaces(sharesDecimals, BigNumber.ROUND_UP);
    if (sharesAmount.times(100).dividedBy(sharesByDecimals).isGreaterThan(99)) {
      return handleWithdrawAll();
    }
    withdraw(convertAmountToRawNumber(sharesAmount, sharesDecimals));
  };

  const handleWithdrawAll = () => {
    const isAll = true;
    setWithdrawSettings((prevState) => ({
      ...prevState,
      amount: underlyingBalance,
      input: underlyingBalance.toFormat(),
      slider: 100,
    }));
    withdraw(convertAmountToRawNumber(sharesByDecimals, sharesDecimals), isAll);
  };

  const withdraw = (sharesAmount, isAll = false) => {
    if (withdrawSettings.isZap) {
      if (withdrawSettings.isSwap) {
        const swapAmountOut = pool.swapEstimate.amountOut;
        const swapAmountOutMin = new BigNumber(
          swapAmountOut - swapAmountOut * withdrawSettings.slippageTolerance
        );
        const zapWithdrawArgs = {
          address,
          web3,
          vaultAddress: pool.earnContractAddress,
          amount: sharesAmount,
          zapAddress: pool.zap.zapAddress,
          tokenOut: withdrawSettings.swapOutput.address,
          amountOutMin: swapAmountOutMin.toFixed(0),
        };
        fetchZapWithdrawAndSwap(zapWithdrawArgs)
          .then(() => {
            enqueueSnackbar(t("Vault-WithdrawSuccess"), { variant: "success" });
            fetchBalances({ address, web3, balances });
          })
          .catch((error) =>
            enqueueSnackbar(t("Vault-WithdrawError", { error }), {
              variant: "error",
            })
          );
      } else {
        const zapWithdrawArgs = {
          address,
          web3,
          vaultAddress: pool.earnContractAddress,
          amount: sharesAmount,
          zapAddress: pool.zap.zapAddress,
        };
        fetchZapWithdrawAndRemoveLiquidity(zapWithdrawArgs)
          .then(() => {
            enqueueSnackbar(t("Vault-WithdrawSuccess"), { variant: "success" });
            fetchBalances({ address, web3, balances });
          })
          .catch((error) =>
            enqueueSnackbar(t("Vault-WithdrawError", { error }), {
              variant: "error",
            })
          );
      }
    } else {
      const vaultWithdrawArgs = {
        address,
        web3,
        isAll,
        amount: sharesAmount,
        contractAddress: pool.earnContractAddress,
        index,
      };
      if (pool.tokenAddress) {
        fetchWithdraw(vaultWithdrawArgs)
          .then(() => {
            enqueueSnackbar(t("Vault-WithdrawSuccess"), { variant: "success" });
            fetchBalances({ address, web3, balances });
          })
          .catch((error) =>
            enqueueSnackbar(t("Vault-WithdrawError", { error }), {
              variant: "error",
            })
          );
      } else {
        fetchWithdrawBnb(vaultWithdrawArgs)
          .then(() => {
            enqueueSnackbar(t("Vault-WithdrawSuccess"), { variant: "success" });
            fetchBalances({ address, web3, balances });
          })
          .catch((error) =>
            enqueueSnackbar(t("Vault-WithdrawError", { error }), {
              variant: "error",
            })
          );
      }
    }
  };

  return (
    <Grid
      item
      xs={12}
      md={shouldHideFromHarvest(pool.name) ? 6 : 5}
      className={classes.sliderDetailContainer}
    >
      <div className={classes.showDetailLeft}>
        {t("Vault-Deposited")}:{" "}
        <a onClick={handleMax} className={classes.balanceMax}>
          {byDecimals(
            sharesBalance.multipliedBy(new BigNumber(pool.pricePerFullShare)),
            pool.lpToken.decimals
          ).toFormat(8)}{" "}
          {pool.lpToken.symbol}
        </a>
      </div>
      <FormControl fullWidth variant="outlined">
        <CustomOutlinedInput
          fullWidth
          value={withdrawSettings.input}
          onChange={handleInputAmountChange}
          endAdornment={
            pool.zap && (
              <FormControl className={classes.zapFormControl}>
                <Select
                  variant="standard"
                  className={classes.zapSelect}
                  value={withdrawSettings.outputIndex}
                  onChange={handleOutputChange}
                >
                  {withdrawOutputs.map((output, i) => (
                    <MenuItem key={i} value={i}>
                      {output.symbol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          }
        />
      </FormControl>
      <CustomSlider
        aria-labelledby="continuous-slider"
        value={withdrawSettings.slider}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
      />
      <div className={classes.showDetailButtonCon}>
        {pool.refund === true ? (
          <RefundButtons
            tokenAddress={pool.rewardToken.contract}
            refundAddress={pool.refundContractAddress}
            index={index}
          />
        ) : (
          <div>
            {withdrawSettings.isNeedApproval ? (
              <div className={classes.showDetailButtonCon}>
                <Button
                  className={`${classes.showDetailButton} ${classes.showDetailButtonContained}`}
                  onClick={handleApproval}
                  disabled={fetchApprovalPending[pool.rewardToken.symbol]}
                >
                  {fetchApprovalPending[pool.rewardToken.symbol]
                    ? `${t("Vault-Approving")}`
                    : `${t("Vault-ApproveButton")}`}
                </Button>
              </div>
            ) : (
              <div className={classes.showDetailButtonCon}>
                <Button
                  className={`${classes.showDetailButton} ${classes.showDetailButtonOutlined}`}
                  type="button"
                  color="primary"
                  disabled={
                    withdrawSettings.amount.isZero() ||
                    fetchZapEstimatePending[pool.tokenAddress]
                  }
                  onClick={handleWithdraw}
                >
                  {fetchWithdrawPending[index]
                    ? `${t("Vault-Withdrawing")}`
                    : `${t("Vault-WithdrawButton")}`}
                </Button>
                {!withdrawSettings.isSwap && (
                  <Button
                    className={`${classes.showDetailButton} ${classes.showDetailButtonOutlined}`}
                    type="button"
                    color="primary"
                    disabled={sharesBalance.isZero()}
                    onClick={handleWithdrawAll}
                  >
                    {fetchWithdrawPending[index]
                      ? `${t("Vault-Withdrawing")}`
                      : `${t("Vault-WithdrawButtonAll")}`}
                  </Button>
                )}
              </div>
            )}
            <div className={classes.zapNote}>
              <span>{t("Vault-WithdrawScenario")}&nbsp;</span>
              {fetchZapEstimatePending[pool.tokenAddress] && (
                <CircularProgress size={12} />
              )}
              <ol>
                <li>
                  {t("Vault-WithdrawScenarioRedeem", {
                    mooToken: pool.rewardToken.symbol,
                    poolToken: pool.lpToken.symbol,
                  })}
                </li>
                {withdrawSettings.isZap && (
                  <li>
                    {t("Vault-WithdrawScenarioRemoveLiquidity", {
                      poolToken: pool.lpToken.symbol,
                      tokenA: pool.assets[0],
                      tokenB: pool.assets[1],
                    })}
                  </li>
                )}
                {withdrawSettings.isSwap && (
                  <li>
                    {t("Vault-WithdrawScenarioSwap", {
                      swapIn: `${convertAmountFromRawNumber(
                        pool.swapEstimate?.amountIn || 0,
                        withdrawSettings.swapInput.decimals
                      )
                        .decimalPlaces(8, BigNumber.ROUND_DOWN)
                        .toFormat()} ${withdrawSettings.swapInput.symbol}`,
                      swapOut: `${convertAmountFromRawNumber(
                        pool.swapEstimate?.amountOut || 0,
                        withdrawSettings.swapOutput.decimals
                      )
                        .decimalPlaces(8, BigNumber.ROUND_DOWN)
                        .toFormat()} ${withdrawSettings.swapOutput.symbol}`,
                      slippageTolerance: `1%`,
                    })}
                  </li>
                )}
                {withdrawSettings.isSwap && (
                  <li>
                    {t("Vault-WithdrawScenarioTotal", {
                      totalOut: `${convertAmountFromRawNumber(
                        pool.swapEstimate?.amountOut * 2 || 0,
                        withdrawSettings.swapOutput.decimals
                      )
                        .decimalPlaces(8, BigNumber.ROUND_DOWN)
                        .toFormat()} ${withdrawSettings.swapOutput.symbol}`,
                    })}
                  </li>
                )}
              </ol>
            </div>
          </div>
        )}
      </div>
    </Grid>
  );
};

export default WithdrawSection;
