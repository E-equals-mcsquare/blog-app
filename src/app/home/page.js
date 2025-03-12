"use client";

import Header from "@/components/header";
import styles from "./page.module.scss";
import Card from "@/components/card";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  const onCreateArticle = () => {
    // Navigate to the new article page
    router.replace("/new");
  };

  return (
    <>
      <Header />
      <div className={styles.banner}>THE BLOG</div>
      {/* This is temporary  */}
      <button onClick={onCreateArticle}>Create New Article</button>
      <div className={styles.allblogposts}>
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    </>
  );
};

export default HomePage;
