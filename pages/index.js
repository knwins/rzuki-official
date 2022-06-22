
import Head from "next/head";
import Mint from "../components/Mint";

export default function Home(props) {
  return (
    <div>
      <Head>
        <title>Mint实例</title>
        <meta name="description" content="Mint实例" />
      </Head>
      <Mint />
    </div>
  );
}
