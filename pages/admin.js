import Head from "next/head";
import Admin from "../components/Admin";

export default function Home() {
  return (
    <div>
      <Head>
        <title>合约管理</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="合约管理" />
      </Head>
      <Admin />
    </div>
  );
}
