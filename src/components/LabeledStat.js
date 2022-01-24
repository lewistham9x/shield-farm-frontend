import React, { forwardRef, memo } from "react";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';

import ValueLoader from "./ValueLoader";
const styles = (theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: (props) => (props.align ? props.align : "center"),
    justifyContent: "center",
  },
  stat: {
    fontSize: "18px",
    fontWeight: "bold",
    color: theme.palette.text.primary,
    lineHeight: "18px",
    letterSpacing: 0,
    position: "relative",
  },
  substat: {
    fontSize: "16px",
    fontWeight: "400",
    color: theme.palette.text.secondary,
    width: "100%",
    textAlign: "center",
    position: "absolute",
    top: "-20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "400",
    color: theme.palette.text.secondary,
    lineHeight: "14px",
    letterSpacing: 0,
  },
  boosted: {
    color: "#2a9e46",
    position: "absolute",
    top: "-20px",
    left: 0,
    right: 0,
  },
  crossed: {
    textDecoration: "line-through",
  },
});

const useStyles = makeStyles(styles);

const LabeledStat = forwardRef(
  (
    { value, label, boosted, isLoading = false, subvalue, ...passthrough },
    ref
  ) => {
    const classes = useStyles();

    return (
      <div {...passthrough} ref={ref}>
        <Typography className={classes.stat} variant="body2" gutterBottom>
          {subvalue && !isLoading ? (
            <span className={classes.substat}>{subvalue}</span>
          ) : (
            ""
          )}
          {boosted ? (
            isLoading ? (
              <ValueLoader />
            ) : (
              <span className={classes.boosted}>{boosted}</span>
            )
          ) : (
            ""
          )}
          {isLoading ? (
            <ValueLoader />
          ) : (
            <span className={boosted ? classes.crossed : ""}>{value}</span>
          )}
        </Typography>
        <Typography className={classes.label} variant="body2">
          {label}
        </Typography>
      </div>
    );
  }
);

export default memo(LabeledStat);
