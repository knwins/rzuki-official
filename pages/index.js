import { useEffect } from "react";
import Head from "next/head";
import WhitelistMint from "../components/WhitelistMint";

export default function Home() {
  
  useEffect(() => {
    if (window.console) {
      console.log("%c您好！", "font-size: 12px;font-weight:bold;");
    }
  }, []);

  return (
    <div>
      <Head>
        <title>标准白名单Mint实例</title>
        <meta name="description" content="标准白名单Mint实例" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <WhitelistMint />
    </div>
  );
}
