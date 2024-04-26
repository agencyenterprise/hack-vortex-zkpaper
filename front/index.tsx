import initACVM from "@noir-lang/acvm_js";
import initNoirC from "@noir-lang/noirc_abi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "react-quill/dist/quill.snow.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createThirdwebClient } from "thirdweb";
import {
  // ConnectButton,
  ThirdwebProvider,
} from "thirdweb/react";
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets";
import "./App.css";
import Component from "./components/index";
import "./styles/globals.css";

import Documents from "./routes/Documents.jsx";
import NewDocument from "./routes/NewDocument.jsx";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./routes/Home.jsx";
import ViewDocument from "./routes/ViewDocument.jsx";

const client = createThirdwebClient({
  clientId: "1eafd11d31d6d24dfceefb36c3de54d2",
});
const wallets = [
  createWallet("io.metamask"),
  walletConnect(),
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "facebook", "phone"],
    },
  }),
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      {/* <ConnectButton
        client={client}
        wallets={wallets}
        chain={defineChain(534351)}
        theme={"dark"}
        connectModal={{ size: "wide" }}
      /> */}
      <InitWasm>
        <ToastContainer />
      </InitWasm>
    </QueryClientProvider>
  </ThirdwebProvider>
);
