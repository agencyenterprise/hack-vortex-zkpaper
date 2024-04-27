import React, { useEffect, useState } from "react";
import ViewDocument from "../components/ViewDocument";
import { getDocumentById } from "../services";
import { useNavigate, useParams } from "react-router";
import { useConnectionStatus, useSDK } from "@thirdweb-dev/react";
import { aesDecryptMessage, decryptWithWallet } from "../utils/encryption";
const exampleDoc = {
  name: "Untitled Document (Decrypt to continue)",
  content: "<p>test <i>italic</i> <b>bold</b></p>",
};


const ViewDocumentPage = () => {
  const sdk = useSDK()
  const [doc, setDoc] = useState(exampleDoc);
  const info = (msg) => toast(msg, { type: "info" });
  const { id } = useParams();
  const navigate = useNavigate();
  const connectionStatus = useConnectionStatus();
  useEffect(() => {
    if (!id) {
      navigate("/")
    }
    hasDocument()
  }, [])
  useEffect(() => {

    if ((window["ethereum"].providers || []).length > 1) {
      const metamaskProvider = window["ethereum"].providers.find((provider) => provider.isMetaMask);
      window["ethereum"] = metamaskProvider;
    }

  }, []);
  const hasDocument = async () => {
    const document = await getDocumentById(id)
    if (!document) {
      return navigate("/")
    }
    console.log(document)
    const { receiverPublicKey, secretKey, document: retrievedDocument } = document
    console.log(document)
    const title = retrievedDocument.documentTitle
    const plainSecret = await decryptWithWallet(secretKey, receiverPublicKey);
    if (retrievedDocument.content) {
      const content = aesDecryptMessage(retrievedDocument.content, plainSecret)
      setDoc({ name: title, content })
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
