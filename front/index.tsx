import React, { ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';
import Component from './components/index';
import EComponent from "./components/encryption.js"
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
import "./styles/globals.css";
import { ScrollSepoliaTestnet } from "@thirdweb-dev/chains"
import {
  ThirdwebProvider
} from "@thirdweb-dev/react";
import { ThirdwebProvider as ThirdwebProviderV5 } from "thirdweb/react"
import { createThirdwebClient } from "thirdweb";
import {
  createWallet,
} from "thirdweb/wallets";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import "./styles/globals.css";

import Documents from "./routes/Documents.jsx";
import NewDocument from "./routes/NewDocument";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./routes/Home.jsx";
import ViewDocument from "./routes/ViewDocument.jsx";

const client = createThirdwebClient({
  clientId: "1eafd11d31d6d24dfceefb36c3de54d2",
});
const wallets = [
  createWallet("io.metamask"),
];

const queryClient = new QueryClient();
const InitWasm = ({ children }) => {
  const [init, setInit] = useState(false);
  useEffect(() => {
    (async () => {
      await Promise.all([
        initACVM(
          new URL(
            "@noir-lang/acvm_js/web/acvm_js_bg.wasm",
            import.meta.url
          ).toString()
        ),
        initNoirC(
          new URL(
            "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm",
            import.meta.url
          ).toString()
        ),
      ]);
      setInit(true);
    })();
  });

  return <div>{init && children}</div>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Component />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/documents",
        element: <Documents />,
      },
      {
        path: "/new-document",
        element: <NewDocument />,
      },
      {
        path: "/document/:id",
        element: <ViewDocument />,
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(

  <ThirdwebProvider
    activeChain={ScrollSepoliaTestnet}
  >
    <ThirdwebProviderV5>
      <QueryClientProvider client={queryClient}>


        <InitWasm>
          <RouterProvider router={router} />
          <EComponent />
          <ToastContainer />
        </InitWasm>
      </QueryClientProvider>
    </ThirdwebProviderV5>
  </ThirdwebProvider>



);
