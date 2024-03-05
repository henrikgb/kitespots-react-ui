import React from "react";
import dynamic from "next/dynamic";

export const KiteSpotsMap = () => {
  const DynamicMap = React.useMemo(() => dynamic(
    () => import("@/components/map/MyMap"),
    {
      loading: () => <p>A map is loading</p>,
      ssr: false // This line is important. It's what prevents server-side render
    }
  ), [/* list variables which should trigger a re-render here */]);
  return (
    <div className="w-full">
      <DynamicMap />
    </div>
  )
}