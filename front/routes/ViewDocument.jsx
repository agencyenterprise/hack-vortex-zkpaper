import React, { useEffect, useState } from "react";
import ViewDocument from "../components/ViewDocument";
import { getDocumentById, retrieveSharedDocumentById } from "../services";
import { useNavigate, useParams } from "react-router";
import { useConnectionStatus, useSDK } from "@thirdweb-dev/react";
import { aesDecryptMessage, decryptWithWallet } from "../utils/encryption";
import { toast } from "react-toastify";
const exampleDoc = {
  name: "Untitled Document (Decrypt to continue)",
  content: "<p>test <i>italic</i> <b>bold</b></p>",
};


const ViewDocumentPage = () => {
  const sdk = useSDK()
  const [doc, setDoc] = useState(exampleDoc);
  const info = (msg) => toast(msg, { type: "info" });
  const error = (msg) => toast(msg, { type: "error" });
  const { sharedDocumentId, documentId } = useParams();
  const navigate = useNavigate();
  const connectionStatus = useConnectionStatus();
  useEffect(() => {
    if (!sharedDocumentId || !documentId) {
      navigate("/")
    }
    hasDocument()
  }, [])
  useEffect(() => {

    if ((window["ethereum"]?.providers || []).length > 1) {
      const metamaskProvider = window["ethereum"].providers.find((provider) => provider.isMetaMask);
      if (metamaskProvider) {
        error("This application only works with Metamask wallets!")
        navigate("/")
      }
      window["ethereum"] = metamaskProvider;
    }

  }, []);
  const hasDocument = async () => {
    try {
      const address = sdk.getSigner()._address
      const document = await retrieveSharedDocumentById(sharedDocumentId, documentId, address, "", "", "")
      console.log(document)
      const sharedDocument = (document.message?.sharedDocument || null)
      if (!sharedDocument) {
        return navigate("/")
      }
      console.log(sharedDocument)
      const { receiverPublicKey, receiverSecretKey } = sharedDocument
      const plainSecret = await decryptWithWallet(receiverSecretKey, receiverPublicKey);
      const title = document.message?.document.title
      if (sharedDocument.content) {
        const content = aesDecryptMessage(sharedDocument.content, plainSecret)
        setDoc({ name: title, content })
      }
    } catch (err) {
      console.log(err)
      info("Failed to retrieve document")
      navigate("/")
    }

  }
  useEffect(() => {
    if (connectionStatus == "disconnected") {
      info("Please connect your wallet to continue")
      navigate("/")
    }
  }, [connectionStatus])
  return (
    <div className="text-white">
      <h1 className="text-center pt-4 pb-8 text-2xl">{doc.name}</h1>
      <ViewDocument data={doc.content} />
    </div>
  );
};

export default ViewDocumentPage;
