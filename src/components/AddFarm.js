import React, { memo, useCallback, useEffect, useState } from "react";
import "./AddFarm.css";
import AddFarmService from "../services/add-farm.service";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
const AddFarm = ({ handleClose, show, children }) => {
  const [farm, setFarm] = useState({});

  const addFarm = () => {
    AddFarmService.addFarm(farm);
  };

  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <IconButton label="Update" onClick={handleClose}>
          <CloseIcon color="primary"></CloseIcon>
        </IconButton>
        <form>
          <label>
            Farm Name:
            <input
              type="text"
              name="name"
              onChange={(e) => setFarm({ ...farm, name: e.target.value })}
            />
          </label>
          <label>
            Chain Name:
            <input
              type="text"
              name="chainName"
              onChange={(e) => setFarm({ ...farm, chainName: e.target.value })}
            />
          </label>
          <label>
            Master Chef Contract:
            <input
              type="text"
              name="masterChef"
              onChange={(e) => setFarm({ ...farm, masterChef: e.target.value })}
            />
          </label>
          <label>
            Website:
            <input
              type="text"
              name="website"
              onChange={(e) => setFarm({ ...farm, website: e.target.value })}
            />
          </label>
          <button type="button" onClick={addFarm}>
            Add Farm
          </button>
        </form>
      </section>
    </div>
  );
};

export default AddFarm;
