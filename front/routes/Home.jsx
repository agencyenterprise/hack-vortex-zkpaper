import React from "react";
import { Button } from "../components/ui/button";
const features = ["Pay with crypto", "No characters limit", "Untraceable"];
import { useNavigate } from 'react-router-dom';
import { createDocument } from "../services";
import { toast } from 'react-toastify'
import { useConnectionStatus, useSDK, useWallet } from "@thirdweb-dev/react";
import ABI from "../utils/DocumentNFT.json";
import { CONTRACT_ADDRESS } from "../utils/network";
import { MutatingDots } from 'react-loader-spinner'
const Home = () => {
  const navigate = useNavigate();
  const error = (msg) => toast(msg, { type: "error" });
  const info = (msg) => toast(msg, { type: "info" });
  const success = (msg) => toast(msg, { type: "success" });
  const [loading, setLoading] = React.useState(false)
  const sdk = useSDK()
  const wallet = useWallet()
  const connectionStatus = useConnectionStatus();
  const hasSubscription = async () => {
    try {
      const contract = await sdk.getContractFromAbi(CONTRACT_ADDRESS, ABI.abi)
      const result = !!(await contract.call("hasSubscriptionOrDocumentsToMint", [sdk.getSigner()._address]))
      return result
    } catch (err) {
      return false
    }
  }
  const buySubscription = async () => {

    try {
      info("Buying a subscription to start creating documents!")
      const price = 0.001 * 10 ** 18
      const contract = await sdk.getContractFromAbi(CONTRACT_ADDRESS, ABI.abi)
      await contract.call("paySubscription", [], { value: price })
      success("Subscription bought successfully!")
      return true
    }
    catch (err) {
      console.log(err)
      error("Failed to buy subscription! You must have at least 0.001 ether on your account")
      return false
    }
  }
  async function signMessage(message) {
    if (connectionStatus !== "connected") {
      error("Please connect your wallet")
      return
    }
    const signature = await sdk.wallet.sign(message)
    const address = sdk.wallet.recoverAddress(message, signature)
    return { signature, address }
  }
  const create = async () => {
    setLoading(true)
    try {
      if (connectionStatus !== "connected") {
        error("Please connect your wallet")
        return
      }
      if (wallet?.walletId !== "metamask") {
        error("This application only works with Metamask wallets!")
        return
      }
      const subscription = await hasSubscription()
      if (!subscription) {
        const newSubscription = await buySubscription()
        if (!newSubscription) {
          return
        }
      }
      const message = new Date().getTime().toString()
      const { signature, address } = await signMessage(message)
      const documentId = await createDocument(address, signature, message)
      if (!documentId) {
        throw new Error("Failed to create document")
      }
      success("Document created successfully!")
      navigate(`/document/editing/${documentId}`, { replace: true });
    } catch (e) {
      console.log(e)
      error("Failed to create document! Try again later.")
    } finally {
      setLoading(false)
    }

  }
  return (
    <div>
      {/* First section */}
      <div className="flex flex-col items-center justify-center max-w-4xl m-auto min-h-[80vh] gap-12 p-12">
        <h2 className="text-white text-2xl md:text-6xl font-semibold text-center">
          Untraceable Document Editor with Proof of Authorship
        </h2>
        <div className="text-[#94A3B8] text-center max-w-xl">
          No one, besides you and your invited peers, will ever be able to read
          the content of the documents, not even our application.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {/* <Link to="/document/editing"> */}
          {!loading ? <Button
            variant="primary"
            className="flex items-center gap-2 justify-center py-6"
            onClick={create}
          >
            Create Document
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.73429 3.13434C9.04671 2.82192 9.55324 2.82192 9.86566 3.13434L14.6657 7.93434C14.9781 8.24676 14.9781 8.75329 14.6657 9.06571L9.86566 13.8657C9.55324 14.1781 9.04671 14.1781 8.73429 13.8657C8.42187 13.5533 8.42187 13.0468 8.73429 12.7343L12.1686 9.30002L2.89998 9.30003C2.45815 9.30002 2.09998 8.94185 2.09998 8.50002C2.09998 8.0582 2.45815 7.70002 2.89998 7.70002H12.1686L8.73429 4.26571C8.42187 3.95329 8.42187 3.44676 8.73429 3.13434Z"
                fill="#0F172A"
              />
            </svg>
          </Button> : <MutatingDots
            visible={true}
            height="100"
            width="100"
            color="#4fa94d"
            secondaryColor="#4fa94d"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />}
          {/* </Link> */}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {features.map((feature, i) => {
            return (
              <div className="text-white flex items-center gap-2" key={i}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                >
                  <path
                    d="M9.5 12L11.5 14L15.5 10M21.5 12C21.5 16.9706 17.4706 21 12.5 21C7.52944 21 3.5 16.9706 3.5 12C3.5 7.02944 7.52944 3 12.5 3C17.4706 3 21.5 7.02944 21.5 12Z"
                    stroke="#67E8F9"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {feature}
              </div>
            );
          })}
        </div>
      </div>
      {/* Second section */}
      <div className="bg-secondary py-12">
        <div className="max-w-6xl m-auto flex md:flex-row flex-col gap-12 items-center px-8">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-[#67E8F9]">FEATURES</span>
            <h2 className="text-white text-xl md:text-4xl font-semibold">
              Bridging Blockchain and Security Solutions
            </h2>
            <div className="text-[#94A3B8]">
              Peace of mind knowing that no one will ever able to read your
              documents
            </div>

          </div>
          <div className="flex-1">
            <img src="/features.png" />
          </div>
        </div>
      </div>
      {/* Third section */}
      <div>
        <div className="bg-primary py-24">
          <div className="max-w-4xl m-auto flex flex-col items-center justify-center  gap-12 px-8">
            <div className="text-[#67E8F9]">HOW IT WORKS</div>
            <h2 className="text-white text-xl md:text-4xl font-semibold text-center">
              Buy Documents as NFTs and Work Locally and Privately in Your
              Browser
            </h2>
            <div className="text-[#94A3B8] text-center max-w-xl">
              You can write any content, private messages, password and more.
            </div>
            <div>
              <img
                src="/steps.png"
                className="hidden md:block"
              />
              <img
                src="/steps-vertical.png"
                className="md:hidden max-w-[140px] m-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
