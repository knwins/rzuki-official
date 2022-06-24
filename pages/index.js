
import Head from "next/head";
import Index from "../components/Index";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Mint实例</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Mint实例" />
      </Head>
      <Index />
    </div>
  );
}
