import React, { memo, useCallback, useEffect, useState } from "react";
import "./AddFarm.css";
import AddFarmService from "../services/add-farm.service";
import {
  Button,
  IconButton,
  TextField,
  Stack,
  MenuItem,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const AddFarm = ({ handleClose, show, children }) => {
  const [farm, setFarm] = useState({});

  const addFarm = () => {
    AddFarmService.addFarm(farm);
  };

  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <IconButton label="Update" onClick={handleClose} size="large">
          <CloseIcon color="primary"></CloseIcon>
        </IconButton>
        <form className="form">
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Farm Name"
                onChange={(e) => setFarm({ ...farm, name: e.target.value })}
              />
            </Stack>
            <Select
              label="Chain"
              onChange={(e) => setFarm({ ...farm, chainName: e.target.value })}
            >
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
              <MenuItem key={"ONE"} value={"ONE"}>
                {"Harmony"}
              </MenuItem>
              <MenuItem key={"ARBI"} value={"ARBI"}>
                {"Arbitrum"}
              </MenuItem>
            </Select>
            <TextField
              fullWidth
              label="MasterChef Contract"
              onChange={(e) => setFarm({ ...farm, masterChef: e.target.value })}
            />
            <TextField
              fullWidth
              label="Website"
              onChange={(e) => setFarm({ ...farm, website: e.target.value })}
            />
            <Button fullWidth size="large" onClick={addFarm}>
              Add Farm
            </Button>
          </Stack>
        </form>
      </section>
    </div>
  );
};

export default AddFarm;
