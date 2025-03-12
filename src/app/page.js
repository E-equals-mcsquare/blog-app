// 'use client';

import Image from "next/image";
import styles from "./page.module.scss";
import NewBlog from "./new/page";
import MyEditor from "./new/MyEditor";
import HomePage from "./home/page";
// import "./page.scss;"

export default function Home() {
  return (
    <div className={styles.page}>
      {/* <NewBlog /> */}
      {/* <MyEditor blogid={0.10647092448837925}/> */}
      <HomePage />
    </div>
  );
}
