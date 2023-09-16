import HeaderNavBar from "@/components/HeaderNavigationBar/HeaderNavBar";
import dynamic from "next/dynamic";
import React from "react";

export default function Home() {
  const DynamicMap = React.useMemo(() => dynamic(
    () => import("../components/MapPage/MyMap"), // replace '@components/map' with your component's location
    {
      loading: () => <p>A map is loading</p>,
      ssr: false // This line is important. It's what prevents server-side render
    }
  ), [/* list variables which should trigger a re-render here */]);
  return (
    <div className="main">
      <HeaderNavBar />
      <div className={"page-body"}>
        <DynamicMap />
      </div>
    </div>
  )
}
