import Head from "next/head";
import Index from "../components/Index";
export default function Home() {
  return (
    <div>
      <Head>
        <title>Rzuki NFT</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Rzuki is a brand" />
        <meta http-equiv="Access-Control-Allow-Origin" content="*" />
      </Head>
      <Index />
    </div>
  );
}
