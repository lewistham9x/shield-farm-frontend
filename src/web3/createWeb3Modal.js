import Web3Modal from "web3modal";

import { getNetworkConnectors } from "../helpers/getNetworkData";

export const createWeb3Modal = (t) => {
  const connectors = getNetworkConnectors(t);
  const modal = new Web3Modal(connectors);

  console.log("connectors", connectors.providerOptions);

  if (
    modal.cachedProvider &&
    connectors.providersOptions &&
    !(modal.cachedProvider in connectors.providerOptions)
  ) {
    modal.clearCachedProvider();
  }

  return modal;
};
