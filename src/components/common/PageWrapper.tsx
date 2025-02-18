import {ReactNode} from "react";

export default function PageWrapper({children}: {children: ReactNode}) {
  return(
    <div className="flex w-full justify-center p-5">
      <div className="w-full max-w-[1280px]">
        {children}
      </div>
    </div>
  )
}