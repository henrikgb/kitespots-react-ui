import HeaderNavBar from "@/components/HeaderNavigationBar/HeaderNavBar";
import {ContactContent} from "@/components/ContactPage/ContactContent";

export default function Contact() {
  return (
    <div className="main">
      <HeaderNavBar />
      <div className={"page-body"}>
        <ContactContent />
      </div>
    </div>
  )
}