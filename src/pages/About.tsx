import HeaderNavBar from "@/components/HeaderNavigationBar/HeaderNavBar";
import {AboutContent} from "@/components/AboutPage/AboutContent";

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