import React, { useState, useEffect } from "react";
import { useOffChainVerification } from "../hooks/useOffChainVerification.js";
import { useProofGeneration } from "../hooks/useProofGeneration.js";
import { encryptWithWallet } from "../utils/encryption.js";
import { useSDK } from "@thirdweb-dev/react";
import axios from "axios"
function EComponent() {
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
    const encStr = encryptWithWallet("oi", buyerEncryptionKey)
    console.log(encStr, 'encStr')
    setEncryptedMessage(encStr)
  }
  async function retrieveEncryptionKey() {
    const accounts = await window["ethereum"].request({ method: 'eth_requestAccounts' })
    const encryptionKey = await window["ethereum"]
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [accounts[0]], // you must have access to the specified account
      })
    return Buffer.from(encryptionKey).toString()

  }




  async function retrieveKeyAndSign() {
    const message = "text_random"
    const encryptionKey = await retrieveEncryptionKey()
    const signature = await signMessage(message)
    return { encryptionKey, signature }

  }
  async function signMessage(message: string) {
    console.log(sdk?.wallet)
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

export default EComponent;
