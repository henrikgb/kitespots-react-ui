// document.tsx

// The Document component is a server-side rendered component that wraps the
// entire application. It is used to augment the application's `<html>` and `<body>` tags.
// Settings that should remain constant between page transitions or affect all pages
// should be defined here.

import { Html, Head, Main, NextScript } from 'next/document';
import React from "react";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/*
          Adding Leaflet's CSS and JS globally, as they are required throughout the application.
          These are loaded once and available for all pages in the application.
        */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
          integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI="
          crossOrigin=""/>
        <Script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
          integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM="
          crossOrigin=""></Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
