import React, { ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';
import Component from './components/index';
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
import "./styles/globals.css";
import {
  ConnectButton,
  ThirdwebProvider
} from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import {
  createWallet,
  walletConnect,
  inAppWallet,
} from "thirdweb/wallets";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
const client = createThirdwebClient({
  clientId: "1eafd11d31d6d24dfceefb36c3de54d2",
});
const wallets = [
  createWallet("io.metamask"),

];

const queryClient = new QueryClient()
const InitWasm = ({ children }) => {
  const [init, setInit] = useState(false);
  useEffect(() => {
    (async () => {
      await Promise.all([
        initACVM(new URL('@noir-lang/acvm_js/web/acvm_js_bg.wasm', import.meta.url).toString()),
        initNoirC(
          new URL('@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm', import.meta.url).toString(),
        ),
      ]);
      setInit(true);
    })();
  });

  return <div>{init && children}</div>;
};



ReactDOM.createRoot(document.getElementById('root')!).render(

  <ThirdwebProvider
  >
    <QueryClientProvider client={queryClient}>
      <ConnectButton
        client={client}
        wallets={wallets}
        chain={defineChain(534351)}
        theme={"dark"}
        connectModal={{ size: "wide" }}
      />
      <InitWasm>
        <Component />
        <ToastContainer />
      </InitWasm>
    </QueryClientProvider>
  </ThirdwebProvider>


);
