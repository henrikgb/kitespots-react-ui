import * as React from "react";
import Link from "next/link";
import {useState} from "react";
import {useTranslation} from 'next-i18next';
import KitespotsLogoSvg from "@/assets/images/KitespotsLogoIconLarge.png";
import Image from "next/image";
import {useActiveLanguage} from "@/util/languageControl/useActiveLanguage";


export default function HeaderNavBar() {
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const { t} = useTranslation();

  useActiveLanguage();

  const closeNav = () => {
    setTimeout(() => {
      setIsNavExpanded(false);
    }, 500);
  }

  return (
    <div className="navigation">
      <div className="w-full max-w-[1280px]">
        <nav className="navContainer">
          <div className="flex mx-4">
            <Image src={KitespotsLogoSvg || ""} alt="Beach Wind Directions" style={{height: 50, width: 50}}/>
          </div>
          <Link href="/" className="brand-name">Kite Spots</Link>
          <button className="hamburger"
            onClick={() => {
              setIsNavExpanded(!isNavExpanded);
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="white"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div
            className={
              isNavExpanded ? "navigation-menu expanded" : "navigation-menu"
            }>
            <ul>
              <li>
                <Link onClick={closeNav} href="/">{t("home")}</Link>
              </li>
              <li>
                <Link onClick={closeNav} href="/About">{t("about")}</Link>
              </li>
              <li>
                <Link onClick={closeNav} href="/Contact">{t("contact")}</Link>
              </li>
              <li>
                <Link onClick={closeNav} href="/Settings">{t("settings")}</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}