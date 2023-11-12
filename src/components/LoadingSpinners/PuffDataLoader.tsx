import PuffLoaderSpinner from "react-spinners/PuffLoader";
import React from "react";

export const PuffDataLoader = () => {
  return(
    <div className="h-full flex flex-col justify-center items-center">
      <PuffLoaderSpinner
        color={"cadetblue"}
        size={100}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      <p className={"font-bold text-sm"} style={{color: "cadetblue"}}>Loading data</p>
    </div>
  )
}