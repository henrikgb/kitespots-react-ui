import styles from "@/styles/Home.module.css";
import HeaderNavBar from "@/components/HeaderNavBar";
import {AboutContent} from "@/components/AboutContent";

export default function About() {
  return (
    <div className={styles.main}>
      <HeaderNavBar />
      <div className={"max-h-full max-w-full bg-amber-100 page-body"}>
        <AboutContent />
        <div>
        </div>
      </div>
    </div>
  )
}