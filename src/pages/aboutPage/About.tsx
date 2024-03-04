// About.tsx
import {AboutContent} from "@/pages/aboutPage/AboutContent";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {GetStaticPropsContext} from "next";
import PageWrapper from "@/components/PageWrapper";

function About() {
  return (
    <PageWrapper><AboutContent /></PageWrapper>
  )
}

// Add getStaticProps at the bottom of your pages/index.tsx file
export async function getStaticProps(context: GetStaticPropsContext) {
  const { locale } = context;
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'home'])), // 'en' is the default locale
    },
  };
}

export default About;
