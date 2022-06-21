import { useEffect } from "react";
import Head from "next/head";
import Mint from "../components/Mint";


// const { MerkleTree } = require('merkletreejs');
// const keccak256 = require('keccak256');

// //create MerkleTree
// //1.保留所有数据到一个数组中
// let whitelistAddresses = ['0x3be3f904996a79d8E8334B6DB7593108e06fA280',
// '0x5cC627205c184FF050A9B53bba3FcC179aF375eA'];

// //2.进行keccak256Hash
// let leafNodes = whitelistAddresses.map(address => keccak256(address));
// //３.生成MerkleTree
// let tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
// console.log('Tree: ', tree.toString());
// //whitelist mint create proof
// //4.当前地址keccak256Hash
// let leaf = keccak256('0x8c5283176f4585D99A2967426e4ff3750110B5fA');

// //5.MerkleTree中找查，如果数值大于0说明找到，否没有找到表示没有在白名单中
// let proof = tree.getHexProof(leaf);

//   //Proof
//     if (proof.length>0) {
//     console.log('Proof of 0x8c5283176f4585D99A2967426e4ff3750110B5fA: ', proof[0]);
//   }


export default function Home() {
  useEffect(() => {
    if (window.console) {
      console.log("%c您好！", "font-size: 12px;font-weight:bold;");
    }
  }, []);

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
