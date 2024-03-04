import { type ReactNode } from "react";
export const TextBox = ({ children }: { children: ReactNode }) => {
  return <div className="text-start max-w-[650px]">{children}</div>;
};
