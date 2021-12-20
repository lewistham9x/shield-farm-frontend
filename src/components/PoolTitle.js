import React, { memo } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
// import { getSingleAssetSrc } from "../helpers/getSingleAssetSrc";

const styles = (theme) => ({
  texts: {
    marginLeft: "20px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    color: theme.palette.text.primary,
    lineHeight: "18px",
    letterSpacing: 0,
    minWidth: "150px",
  },
  subtitle: {
    fontSize: "14px",
    fontWeight: "400",
    color: theme.palette.text.secondary,
    lineHeight: "14px",
    letterSpacing: 0,
  },
  url: {
    fontSize: "16px",
    fontWeight: "600",
    color: theme.palette.text.primary,
    lineHeight: "14px",
    letterSpacing: 0,
    "&:hover,&:focus": {
      color: theme.palette.text.secondary,
    },
  },
  icon: {
    color: theme.palette.text.primary,
    marginLeft: "4px",
    "flex-shrink": 0,
    width: "45px",
    height: "45px",
    "& .MuiAvatarGroup-avatar": {
      border: "none",
      width: "65%",
      height: "65%",
      "&:first-child": {
        position: "absolute",
        top: 0,
        left: 0,
      },
      "&:last-child": {
        position: "absolute",
        bottom: 0,
        right: 0,
      },
    },
  },
  chainName: {
    color: theme.palette.text.primary,
    marginLeft: "4px",
    "flex-shrink": 0,
    fontSize: "16px",
    fontWeight: "bold",
    color: theme.palette.text.primary,
    lineHeight: "30px",
    letterSpacing: 0,
  },
  btnBoost: {
    marginTop: "8px",
    marginRight: "5px",
    padding: "4px 26px 4px 6px",
    border: "solid 2px #5a8f69",
    borderRadius: "4px",
    height: "32px",
    whiteSpace: "nowrap",
    position: "relative",
    width: "108px",
    display: "block",
    "& span": {
      position: "absolute",
      top: 0,
      right: 0,
    },
    "& img": {
      verticalAlign: "middle",
    },
    "&:hover": {
      backgroundColor: "#5a8f69",
    },
    "&:hover img": {
      filter:
        "invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg) brightness(1000%) contrast(1000%)",
    },
  },
});

const useStyles = makeStyles(styles);

const PoolTitle = ({
  name,
  // logo,
  chainName,
  poolId,
  description,
  // launchpool,
  // buyTokenUrl,
  // addLiquidityUrl,
  // removeLiquidityUrl,
  // assets,
  // multipleLaunchpools = false,
}) => {
  const { chain } = useParams();

  const classes = useStyles();
  const { t } = useTranslation();

  // let avatar;
  // if (logo) {
  //   avatar = (
  //     <Avatar
  //       alt={logo}
  //       variant="square"
  //       className={classes.icon}
  //       imgProps={{ style: { objectFit: "contain" } }}
  //       src={require(`images/${logo}`)}
  //     />
  //   );
  // } else {
  // avatar = (
  //   <AvatarGroup
  //     className={`${classes.icon} MuiAvatar-root MuiAvatar-square`}
  //     spacing="small"
  //   >
  //     <Avatar
  //       alt={assets[0]}
  //       variant="square"
  //       imgProps={{ style: { objectFit: "contain" } }}
  //       src={getSingleAssetSrc(assets[0])}
  //     />
  //     <Avatar
  //       alt={assets[1]}
  //       variant="square"
  //       imgProps={{ style: { objectFit: "contain" } }}
  //       src={getSingleAssetSrc(assets[1])}
  //     />
  //   </AvatarGroup>
  // );
  // }

  return (
    <Grid container wrap="nowrap">
      <Typography className={classes.chainName} variant="body2" gutterBottom>
        {chainName}
      </Typography>
      <div className={classes.texts}>
        <Typography className={classes.title} variant="body2" gutterBottom>
          {poolId
            ? // <Link to={`/${chain}/vault/${poolId}`} className={classes.url}>
              { name }
            : // </Link>
              name}
        </Typography>
        <Typography className={classes.subtitle} variant="body2">
          {description}
        </Typography>
        {/* <div style={{ display: "flex", marginTop: "6px" }}>
          {buyTokenUrl ? (
            <a
              className={classes.url}
              href={buyTokenUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{name === "WBNB" ? t("Wrap-BNB") : t("Buy-Token")}</span>
              {"\u00A0\u00A0"}
            </a>
          ) : (
            ""
          )} */}
        {/* {addLiquidityUrl ? (
            <a
              className={classes.url}
              href={addLiquidityUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("Add-Liquidity")}</span>
            </a>
          ) : (
            ""
          )}
          {removeLiquidityUrl ? (
            <a
              className={classes.url}
              href={removeLiquidityUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("Remove-Liquidity")}</span>
            </a>
          ) : (
            ""
          )} */}
        {/* </div> */}
        {/* {launchpool ? (
          <Link
            to={
              multipleLaunchpools
                ? `/${chain}/stake`
                : `/${chain}/stake/pool/${launchpool.id}`
            }
            className={classes.btnBoost}
          >
            <img
              alt="Boost"
              src={require("images/stake/boost.svg")}
              height={15}
            />
            <span>
              <img
                alt="Fire"
                src={require("images/stake/fire.png")}
                height={30}
              />
            </span>
          </Link>
        ) : (
          ""
        )} */}
      </div>
    </Grid>
  );
};

export default memo(PoolTitle);
