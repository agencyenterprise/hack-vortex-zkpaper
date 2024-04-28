import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { NavLink } from "react-router-dom"; // Changed from 'Link' to 'NavLink'
import { Button } from "../components/ui/button";
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import {
  createWallet,
} from "thirdweb/wallets";
import { ConnectWallet } from "@thirdweb-dev/react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Documents", href: "/documents" },
  { name: "Shared Documents", href: "/shared/documents" },
];
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavLinkClass = (isActive) => {
    return isActive
      ? "text-sm leading-6 text-[#67E8F9] transition"
      : "text-sm leading-6 text-[#94A3B8] hover:text-[#67E8F9] transition";
  };

  return (
    <header>
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between py-2 px-6 lg:px-8 bg-[#1E293B] m-4 rounded-lg"
        aria-label="Global"
      >
        <NavLink
          to="/"
          className={({ isActive }) => getNavLinkClass(isActive)}
        >
          <img
            src="/logo.png"
            className="h-12"
          />
        </NavLink>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon
              className="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <NavLink
              to={item.href}
              key={item.name}
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
        <div className="flex items-left">
          <ConnectWallet switchToActiveChain={true} />
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <NavLink
              to="/"
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <img
                src="/logo.png"
                className="h-8"
              />
            </NavLink>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon
                className="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <NavLink
                    to={item.href}
                    key={item.name}
                    className={({ isActive }) => getNavLinkClass(isActive)}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
