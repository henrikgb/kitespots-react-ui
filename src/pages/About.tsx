import HeaderNavBar from "@/components/HeaderNavBar";
import {AboutContent} from "@/components/AboutContent";

export default function About() {
  return (
    <div className="main">
      <HeaderNavBar />
      <div className={"page-body"}>
        <AboutContent />
        <div>
        </div>
      </div>
    </div>
  )
}