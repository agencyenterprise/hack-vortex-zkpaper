import React, { useState, useEffect } from "react";
import { useOffChainVerification } from "../hooks/useOffChainVerification.js";
import { useProofGeneration } from "../hooks/useProofGeneration.js";
import Editor from "./Editor.jsx";
import Header from "./Header.jsx";
import ViewDocument from "./ViewDocument.jsx";
import { encryptText } from "../utils/encryption.js";
import { useSDK } from "@thirdweb-dev/react";
import axios from "axios"
function Component() {
  const [input, setInput] = useState<
    { num_writes: string; num_pastes: string } | undefined
  >();
  const [buyerAccount, setBuyerAccount] = useState<string>('');
  const [encryptedMessage, setEncryptedMessage] = useState<string>('');
  const [buyerEncryptionKey, setBuyerEncryptionKey] = useState<string>('');
  const { noir, proofData } = useProofGeneration(input, "work");
  const sdk = useSDK();
  useOffChainVerification(noir, proofData);
  useEffect(() => {

    if ((window["ethereum"].providers || []).length > 1) {
      const metamaskProvider = window["ethereum"].providers.find((provider) => provider.isMetaMask);
      window["ethereum"] = metamaskProvider;
    }

  }, []);
  function lockLicense() {
    const encStr = encryptText("oi", buyerEncryptionKey)
    console.log(encStr, 'encStr')
    setEncryptedMessage(encStr)
  }
  async function signMessage(message: string) {
    const signature = await sdk!.wallet.sign(message)
    console.log(sdk!.wallet.recoverAddress(message, signature))
    console.log(signature, 'signature')
    return signature
  }
  async function createSharedDocument() {

    console.log('1')
    const receiverSignature = await signMessage('oi')
    const receiverPublicKey = await sdk!.wallet.getAddress()
    console.log(receiverSignature, 'signedMessage')
    fetch('http://localhost:3001/api/document/share/keys/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: '1',
        receiverPublicKey,
        receiverSignature,
        receiverSignatureMessage: "oi"
      })
    }).then((res) => res.json()).then((res) => console.log(res)).catch((err) => console.log(err))
    // do the same thing with axios
    const response = await axios.post('http://localhost:3001/api/document/share/keys/create', {
      documentId: '1',
      receiverPublicKey,
      receiverSignature,
      receiverSignatureMessage: "oi"
    })
    console.log(response)

  }
  function getLicense() {
    window["ethereum"]
      .request({
        method: 'eth_decrypt',
        params: [encryptedMessage, buyerAccount],
      })
      .then((decryptedMessage: string) =>
        console.log(decryptedMessage)
      )
  }
  function getEncryptionKey() {
    window["ethereum"]
      .request({ method: 'eth_requestAccounts' })
      .then((account: any) => {
        setBuyerAccount(account[0])
        window["ethereum"]
          .request({
            method: 'eth_getEncryptionPublicKey',
            params: [account[0]], // you must have access to the specified account
          })
          .then((result: string) => {
            console.log(Buffer.from(result).toString())
            setBuyerEncryptionKey(Buffer.from(result).toString())
          })
      })
  }
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget.elements;
    if (!elements) return;

    const x = elements.namedItem("x") as HTMLInputElement;
    const y = elements.namedItem("y") as HTMLInputElement;

    setInput({ num_writes: x.value, num_pastes: y.value });
  };

  return (
    <main>
      <Header />
      <Editor />
      <ViewDocument />
      <form
        className="container"
        onSubmit={submit}
      >
        <h1>Example starter</h1>
        <h2>This circuit checks that x and y are different (yey!)</h2>
        <p>Try it!</p>
        <input
          name="x"
          type="text"
          className="border-black border"
        />
        <input
          name="y"
          type="text"
          className="border-black border"
        />
        <button
          type="submit"
          className="bg-blue-500"
        >
          Calculate proof
        </button>
      </form><div><button
        type="button"
        className="bg-blue-500"
        onClick={getEncryptionKey}
      >Click</button>
      </div>
      <div>
        <button
          type="button"
          className="bg-blue-500"
          onClick={lockLicense}
        >encrypt</button></div>
      <div>
        <button
          type="button"
          className="bg-blue-500"
          onClick={getLicense}
        >decrypt</button></div>
      <div>
        <button
          type="button"
          className="bg-yellow-500"
          onClick={createSharedDocument}
        >sign</button></div>
    </main >
  );
}

export default Component;
