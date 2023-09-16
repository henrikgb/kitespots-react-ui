import HeaderNavBar from "@/components/HeaderNavBar";
import {ContactContent} from "@/components/ContactContent";

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