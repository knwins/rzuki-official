import { useEffect } from "react";
import Head from "next/head";
import WhitelistMint from "../components/WhitelistMint";


const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

//create MerkleTree
let whitelistAddresses = ['0x3be3f904996a79d8E8334B6DB7593108e06fA280','0x5cC627205c184FF050A9B53bba3FcC179aF375eA'];
let leafNodes = whitelistAddresses.map(address => keccak256(address));
let tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
console.log('Tree: ', tree.toString());


//whitelist mint create proof
let leaf = keccak256('0x3be3f904996a79d8E8334B6DB7593108e06fA280');
let proof = tree.getHexProof(leaf);
//Proof
console.log('Proof of 0x3be3f904996a79d8E8334B6DB7593108e06fA280: ', proof);

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
      </Head>
      <WhitelistMint />
    </div>
  );
}
