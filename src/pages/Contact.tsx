import HeaderNavBar from "@/components/HeaderNavBar";
import {ContactContent} from "@/components/ContactContent";
import styles from "@/styles/Home.module.css";

export default function Contact() {
  return (
    <div className={styles.main}>
      <HeaderNavBar />
      <div className={"h-fit w-full bg-amber-100 page-body"}>
        <ContactContent />
      </div>
    </div>
  )
}