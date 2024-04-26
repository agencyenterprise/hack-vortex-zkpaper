import React from "react";
import { Button } from "../components/ui/button";

const features = ["Pay with crypto", "No characters limit", "Untraceable"];

const Home = () => {
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
          <Button
            variant="primary"
            className="flex items-center gap-2 justify-center py-6"
          >
            Create Document{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.73429 3.13434C9.04671 2.82192 9.55324 2.82192 9.86566 3.13434L14.6657 7.93434C14.9781 8.24676 14.9781 8.75329 14.6657 9.06571L9.86566 13.8657C9.55324 14.1781 9.04671 14.1781 8.73429 13.8657C8.42187 13.5533 8.42187 13.0468 8.73429 12.7343L12.1686 9.30002L2.89998 9.30003C2.45815 9.30002 2.09998 8.94185 2.09998 8.50002C2.09998 8.0582 2.45815 7.70002 2.89998 7.70002H12.1686L8.73429 4.26571C8.42187 3.95329 8.42187 3.44676 8.73429 3.13434Z"
                fill="#0F172A"
              />
            </svg>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2 justify-center py-6"
          >
            Import Document{" "}
            <svg
              className="w-7 h-7 mt-2"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="24"
              viewBox="0 0 21 24"
              fill="none"
            >
              <g filter="url(#filter0_d_2010_32)">
                <path
                  d="M6.89998 10.9C5.35358 10.9 4.09998 9.64645 4.09998 8.10005C4.09998 6.65335 5.19715 5.46291 6.60479 5.31542C6.5364 5.05511 6.49998 4.78183 6.49998 4.50005C6.49998 2.73274 7.93266 1.30005 9.69998 1.30005C11.203 1.30005 12.4641 2.33635 12.8076 3.73345C12.9686 3.71142 13.1329 3.70005 13.3 3.70005C15.2882 3.70005 16.9 5.31182 16.9 7.30005C16.9 9.28827 15.2882 10.9 13.3 10.9H11.3V8.03142L12.3343 9.06573C12.6467 9.37815 13.1532 9.37815 13.4657 9.06573C13.7781 8.75331 13.7781 8.24678 13.4657 7.93436L11.0657 5.53436C10.7532 5.22194 10.2467 5.22194 9.93429 5.53436L7.53429 7.93436C7.22187 8.24678 7.22187 8.75331 7.53429 9.06573C7.84671 9.37815 8.35324 9.37815 8.66566 9.06573L9.69998 8.03142L9.69998 10.9H6.89998Z"
                  fill="#67E8F9"
                />
                <path
                  d="M9.69998 10.9H11.3L11.3 14.9C11.3 15.3419 10.9418 15.7 10.5 15.7C10.0581 15.7 9.69998 15.3419 9.69998 14.9L9.69998 10.9Z"
                  fill="#67E8F9"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_2010_32"
                  x="-1.5"
                  y="0.5"
                  width="24"
                  height="24"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood
                    flood-opacity="0"
                    result="BackgroundImageFix"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="4" />
                  <feGaussianBlur stdDeviation="2" />
                  <feComposite
                    in2="hardAlpha"
                    operator="out"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_2010_32"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_2010_32"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {features.map((feature) => {
            return (
              <div className="text-white flex items-center gap-2">
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
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
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
            <Button
              variant={"primary"}
              className="w-fit"
            >
              Create Document
            </Button>
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
