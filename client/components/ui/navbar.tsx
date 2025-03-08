"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import WalletConnect from "../WalletConnect";

const links = [
  { name: "Explore", href: "/explore", searchHref: "/explore" },
  { name: "Dashboard", href: "/investor", searchHref: "/investor" },
  { name: "KYC", href: "/kyc", searchHref: "/kyc" },
];

const NavBar = () => {
  const currentPath = usePathname();
  const isActive = (itemLink: string) => {
    // Exact match for root, starts with for other paths
    return itemLink === "/"
      ? currentPath === itemLink
      : currentPath.startsWith(itemLink) || currentPath === itemLink;
  };

  return (
    <>{currentPath !== "/" && (<header className="border-grid sticky top-0 z-[60] w-full border-b border-dashed  backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-white">
      <div className="container-wrapper border">
        <div className="container flex h-14 items-center gap-2 justify-between px-5 md:gap-4 border">
          <a href="/">
            <img src="/images/icon.png" className="w-8 h-8" alt="Logo" />
          </a>
          <nav className="flex items-center gap-7 border">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                className={`
              text-l font-light
              ${
                isActive(item.searchHref)
                  ? "text-stone-100"
                  : "text-stone-400 hover:text-stone-200"
              }
            `}
              >
                {item.name}
              </Link>
            ))}
            <WalletConnect />
          </nav>
        </div>
      </div>
    </header>)}
    </>
    
  );
};

export default NavBar;
