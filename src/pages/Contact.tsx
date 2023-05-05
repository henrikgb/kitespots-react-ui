import Head from 'next/head'
import HeaderNavBar from "@/components/HeaderNavBar";
import React from "react";
import {ContactContent} from "@/components/ContactContent";
import styles from "@/styles/Home.module.css";

export default function Contact() {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.main}>
                <HeaderNavBar />
                <div className={"max-h-full max-w-full bg-amber-400 page-body"}>
                    <ContactContent />
                </div>
            </div>
        </>
    )
}