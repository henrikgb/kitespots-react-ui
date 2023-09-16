import dynamic from 'next/dynamic';
import React from "react";

export default function Home() {
  const DynamicMap = React.useMemo(() => dynamic(
    () => import("../components/MapPage/MyMap"),
    {
      loading: () => <p>A map is loading</p>,
      ssr: false // This line is important. It's what prevents server-side render
    }
  ), [/* list variables which should trigger a re-render here */]);
  return (
    <div>
      <DynamicMap />
    </div>
  )
}
