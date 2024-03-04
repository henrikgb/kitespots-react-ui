import * as React from "react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {useTranslation} from 'next-i18next';
import usei18LanguageStore from "@/store/i18languageStore";
import KitespotsLogoSvg from "@/assets/images/KitespotsLogoIconLarge.svg";
import Image from "next/image";


export default function HeaderNavBar() {
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const { t, i18n } = useTranslation();
  const {activeLanguage} = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  const closeNav = () => {
    // Use setTimeout to close the menu after 1 second
    setTimeout(() => {
      setIsNavExpanded(false);
    }, 500); // 1000 milliseconds = 1 second
  }

  return (
    <nav className="navigation">
      <div className="flex mx-4">
        <Image src={KitespotsLogoSvg || ""} alt="Beach Wind Directions" style={{height: 50, width: 50}}/>
      </div>
      <Link href="/" className="brand-name">Kite Spots</Link>
      <button className="hamburger"
        onClick={() => {
          setIsNavExpanded(!isNavExpanded);
        }}>
        {/* icon from heroicons.com */}
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
            <Link onClick={closeNav} href="/aboutPage/About">{t("about")}</Link>
          </li>
          <li>
            <Link onClick={closeNav} href="/contactPage/Contact">{t("contact")}</Link>
          </li>
          <li>
            <Link onClick={closeNav} href="/settingsPage/Settings">{t("settings")}</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}