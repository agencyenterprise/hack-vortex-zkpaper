import React, { useEffect, useState } from "react";
import Editor from "../components/Editor";
import { Button } from "../components/ui/button";
import { useSDK, useConnectionStatus, useWallet } from "@thirdweb-dev/react";
import { appendDocument, createDocument, getDocumentById } from "../services";
import { toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
const NewDocument = () => {
  const [documentName, setDocumentName] = useState("Untitled Document");
  const [document, setEditing] = useState(false);
  const sdk = useSDK()
  const wallet = useWallet()
  const info = (msg: string) => toast(msg, { type: "info" });
  const { id } = useParams();
  const navigate = useNavigate();
  const error = (msg) => toast(msg, { type: "error" });
  const connectionStatus = useConnectionStatus();
  useEffect(() => {
    if (!id) {
      navigate("/")
    }
    hasDocument()
  }, [])
  const hasDocument = async () => {
    const document = await getDocumentById(id!)
    if (!document) {
      navigate("/")
    }
  }

  useEffect(() => {
    if (connectionStatus == "disconnected") {
      info("Please connect your wallet to continue")
      navigate("/")
    }
  }, [connectionStatus])
  useEffect(() => {

    if ((window["ethereum"]?.providers || []).length > 1) {
      const metamaskProvider = window["ethereum"].providers.find((provider) => provider.isMetaMask);
      window["ethereum"] = metamaskProvider;
    }

  }, []);
  async function retrieveEncryptionKey() {
    const accounts = await window["ethereum"].request({ method: 'eth_requestAccounts' })
    const encryptionKey = await window["ethereum"]
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [accounts[0]], // you must have access to the specified account
      })

    return { key: Buffer.from(encryptionKey).toString(), account: accounts[0] }

  }
  async function retrieveKeyAndSign() {
    const message = "text_random"
    const { key: encryptionKey, account } = await retrieveEncryptionKey()
    const signature = await signMessage(message)
    console.log({ encryptionKey, signature, account })
    return { encryptionKey, signature, account }

  }
  async function signMessage(message: string) {
    const signature = await sdk!.wallet.sign(message)
    console.log(sdk!.wallet.recoverAddress(message, signature))
    console.log(signature, 'signature')
    return signature
  }
  const handleSaveName = () => {
    setEditing(false);
    if (documentName === "") {
      setDocumentName("Untitled Document");
    }
  };

  const handleEditName = () => {
    setEditing(true);
    if (documentName === "Untitled Document") {
      setDocumentName("");
    }
  };
  const saveDocument = async () => {
    if (wallet?.walletId !== "metamask") {
      error("This application only works with Metamask wallets!")
      navigate("/")
      return
    }
    const message = "text_random"
    const { encryptionKey, signature, account: userAccount } = await retrieveKeyAndSign()
    await appendDocument(userAccount, signature, message, encryptionKey, id!)
  }
  return (
    <div className="container m-auto flex flex-col items-center text-white">
      <div className="w-full">
        <div className="flex mt-4 mb-8 gap-4 justify-between">
          <div className="w-full">
            {document ? (
              <div className="w-full flex">
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="bg-primary text-white border border-gray-600 rounded-lg px-2 py-1 text-xl outline-none w-full"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-primary text-white p-2 rounded-lg"
                >
                  <svg
                    width="18"
                    height="13"
                    viewBox="0 0 18 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M17.7071 0.292893C18.0976 0.683417 18.0976 1.31658 17.7071 1.70711L6.70711 12.7071C6.31658 13.0976 5.68342 13.0976 5.29289 12.7071L0.292893 7.70711C-0.0976311 7.31658 -0.0976311 6.68342 0.292893 6.29289C0.683417 5.90237 1.31658 5.90237 1.70711 6.29289L6 10.5858L16.2929 0.292893C16.6834 -0.0976311 17.3166 -0.0976311 17.7071 0.292893Z"
                      fill="#67E8F9"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <h3 className="text-2xl flex items-center gap-4">
                <div className="max-w-[280px] truncate">{documentName}</div>
                <button onClick={handleEditName}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11 20C11 19.4477 11.4477 19 12 19H21C21.5523 19 22 19.4477 22 20C22 20.5523 21.5523 21 21 21H12C11.4477 21 11 20.5523 11 20Z"
                      fill="#67E8F9"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18 3.87866C17.7026 3.87866 17.4174 3.9968 17.2071 4.20709L4.90299 16.5112L4.37439 18.6256L6.48877 18.097L18.7929 5.79288C18.897 5.68875 18.9796 5.56514 19.036 5.42909C19.0923 5.29305 19.1213 5.14724 19.1213 4.99998C19.1213 4.85273 19.0923 4.70692 19.036 4.57087C18.9796 4.43483 18.897 4.31121 18.7929 4.20709C18.6888 4.10296 18.5652 4.02037 18.4291 3.96402C18.2931 3.90767 18.1473 3.87866 18 3.87866ZM15.7929 2.79288C16.3783 2.20751 17.1722 1.87866 18 1.87866C18.4099 1.87866 18.8158 1.9594 19.1945 2.11626C19.5732 2.27312 19.9173 2.50303 20.2071 2.79288C20.497 3.08272 20.7269 3.42681 20.8837 3.8055C21.0406 4.1842 21.1213 4.59008 21.1213 4.99998C21.1213 5.40988 21.0406 5.81576 20.8837 6.19446C20.7269 6.57316 20.497 6.91725 20.2071 7.20709L7.70713 19.7071C7.57897 19.8352 7.41839 19.9262 7.24256 19.9701L3.24256 20.9701C2.90178 21.0553 2.54129 20.9555 2.29291 20.7071C2.04453 20.4587 1.94468 20.0982 2.02988 19.7574L3.02988 15.7574C3.07384 15.5816 3.16476 15.421 3.29291 15.2929L15.7929 2.79288Z"
                      fill="#67E8F9"
                    />
                  </svg>
                </button>
              </h3>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              variant={"secondary"}
              className="flex items-center gap-2"
              onClick={saveDocument}
            >
              Save{" "}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.46348 2.9451C6.89851 2.72329 6.29048 2.63295 5.68543 2.68094C5.08037 2.72892 4.49418 2.91397 3.97124 3.22207C3.44829 3.53016 3.00232 3.95322 2.6671 4.4592C2.33188 4.96518 2.1162 5.54081 2.03639 6.14249C1.95659 6.74418 2.01476 7.35613 2.20649 7.932C2.39823 8.50787 2.7185 9.03256 3.14304 9.46632C3.40058 9.72945 3.39605 10.1515 3.13293 10.4091C2.8698 10.6666 2.44771 10.6621 2.19017 10.399C1.62411 9.82061 1.19708 9.12102 0.941435 8.3532C0.685791 7.58537 0.608233 6.76943 0.714636 5.96719C0.821039 5.16494 1.10861 4.39743 1.55558 3.72279C2.00254 3.04815 2.59717 2.48407 3.29442 2.07328C3.99168 1.66249 4.77328 1.41576 5.58001 1.35178C6.38675 1.2878 7.19746 1.40824 7.95075 1.70399C8.70405 1.99974 9.38016 2.46304 9.92787 3.05879C10.3615 3.53044 10.7056 4.07532 10.9451 4.66664H11.6665C11.6666 4.66664 11.6665 4.66664 11.6665 4.66664C12.4532 4.66657 13.2191 4.91951 13.851 5.38811C14.483 5.85672 14.9474 6.51616 15.1758 7.269C15.4041 8.02184 15.3843 8.82817 15.1192 9.56887C14.8541 10.3096 14.3578 10.9454 13.7036 11.3823C13.3974 11.5869 12.9834 11.5044 12.7789 11.1983C12.5744 10.8921 12.6568 10.4781 12.963 10.2736C13.3793 9.99553 13.6951 9.59093 13.8638 9.11957C14.0325 8.64822 14.0451 8.1351 13.8998 7.65602C13.7545 7.17694 13.459 6.7573 13.0568 6.45909C12.6547 6.16088 12.1673 5.99992 11.6667 5.99997H10.4733C10.1785 5.99997 9.91879 5.80644 9.83447 5.52404C9.66083 4.94245 9.35711 4.40802 8.94632 3.9612C8.53553 3.51439 8.02845 3.16691 7.46348 2.9451Z"
                  fill="#67E8F9"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.00004 7.33337C8.36823 7.33337 8.66671 7.63185 8.66671 8.00004V14C8.66671 14.3682 8.36823 14.6667 8.00004 14.6667C7.63185 14.6667 7.33337 14.3682 7.33337 14V8.00004C7.33337 7.63185 7.63185 7.33337 8.00004 7.33337Z"
                  fill="#67E8F9"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.86189 10.8619C5.12224 10.6015 5.54435 10.6015 5.8047 10.8619L7.99996 13.0572L10.1952 10.8619C10.4556 10.6015 10.8777 10.6015 11.138 10.8619C11.3984 11.1222 11.3984 11.5443 11.138 11.8047L8.47136 14.4714C8.21101 14.7317 7.7889 14.7317 7.52855 14.4714L4.86189 11.8047C4.60154 11.5443 4.60154 11.1222 4.86189 10.8619Z"
                  fill="#67E8F9"
                />
              </svg>
            </Button>
          </div>
        </div>
        <Editor documentName={documentName} id={id} setTitle={setDocumentName} />
      </div>
    </div>
  );
};

export default NewDocument;
