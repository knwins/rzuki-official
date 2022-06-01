import { useState, useEffect } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import Typography from "@mui/material/Typography";

import { get, subscribe } from "../store";
import Container from "./Container";
import ConnectWallet, { connectWallet } from "./ConnectWallet";
import showMessage from "./showMessage";

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

//网络选择
const ETHERSCAN_DOMAIN =
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "etherscan.io"
    : "rinkeby.etherscan.io";

//定义Content style
const Content = styled.div`
  max-width: 840px;
  margin: 0 auto 5% auto;
  strong {
    color: red;
  }
`;


//定义 MintButton Style
const StyledMintButton = styled.div`
  display: inline-block;
  width: 140px;
  text-align: center;
  padding: 10px 10px;
  border: 4px solid #000;
  border-radius: 20px;
  color: #000;
  background: #dde4b6;
  cursor: ${(props) => {
    return props.minting || props.disabled ? "not-allowed" : "pointer";
  }};

  /*透明度*/
  opacity: ${(props) => {
    return props.minting || props.disabled ? 0.4 : 1;
  }};
`;


function MintButton(props) {

  const [minting, setMinting] = useState(false);
  return (
    <StyledMintButton
      disabled={!!props.disabled}
      minting={minting}
      onClick={async () => {
        if (minting || props.disabled) {
          return;
        }
        setMinting(true);
        try {
          const fullAddressInStore = get("fullAddress") || null;
          if (fullAddressInStore) {
            const { signer, contract } = await connectWallet();
            const contractWithSigner = contract.connect(signer);
            const value = ethers.utils.parseEther(props.mintAmount === 1 ? "0.001" : "0.002");

            //create MerkleTree
            //1.保留所有数据到一个数组中
            let whitelistAddresses = ['0x3be3f904996a79d8E8334B6DB7593108e06fA280',
            '0x5cC627205c184FF050A9B53bba3FcC179aF375eA'];

            //2.进行keccak256Hash
            let leafNodes = whitelistAddresses.map(address => keccak256(address));
            //３.生成MerkleTree
            let tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

            //whitelist mint create proof
            //4.当前地址keccak256Hash
            let leaf = keccak256(fullAddressInStore);

            //5.MerkleTree中找查，如果数值大于0说明找到，否没有找到表示没有在白名单中
            let proof = tree.getHexProof(leaf);

            //Proof
            if (proof.length==0) {
              showMessage({
                type: "success",
                title: "提示",
                body: "can't find you on the whitelist"
              });
            }

            const tx = await contractWithSigner.whitelistMint(props.mintAmount, {value,},proof[0]);
            const response = await tx.wait();
            showMessage({
            type: "success",
            title: "铸造成功",
            body: (<div> <a href={`https://${ETHERSCAN_DOMAIN}/tx/${response.transactionHash}`} target="_blank" rel="noreferrer">点击查看交易详情</a></div>),
          });
          }


        } catch (err) {
          showMessage({
            type: "error",
            title: "铸造失败",
            body: err.message,
          });
        }
        props.onMinted && props.onMinted();
        setMinting(false);
      }}
      style={{
        background: "#dde4b6",
        ...props.style,
      }}
    >
      铸造 {props.mintAmount} 个{minting ? "中..." : ""}
    </StyledMintButton>
  );
}

function WhiteMintSection() {

  //初始化数据定义
  const [status, setStatus] = useState("0");
  const [progress, setProgress] = useState(null);//进度
  const [fullAddress, setFullAddress] = useState(null);//完整地址
  const [numberMinted, setNumberMinted] = useState(0);//已minted数量
  const [maxSupplyWhitlist, setMaxSupplyWhitlist] = useState(0);//白名单总供应量
  const [maxPurchaseWL, setMaxPurchaseWL] = useState(0);//白名单最大mint个数
  const [mintPrice, setMintPrice] = useState(0);//白名单mint价格


　//状态改变函数
  async function updateStatus() {
    const { contract } = await connectWallet();
    const status = await contract.status();
    const progress = parseInt(await contract.totalSupply());
    const maxSupplyWhitlist = parseInt(await contract.maxSupplyWhitlist()); //获取白名单最大供应量
    const maxPurchaseWL = parseInt(await contract.maxPurchaseWL());//获取单个地址最在mint数量
    const mintPrice=parseInt(await contract.mintPriceWL());//获取白名单mint价格

    setStatus(status.toString());
    setProgress(progress);
    setMaxSupplyWhitlist(maxSupplyWhitlist);
    setMaxPurchaseWL(maxPurchaseWL);
    setMintPrice(mintPrice/(10**18));

    // 在 mint 事件的时候更新数据
    contract.on("Minted", async (event) => {
      const status = await contract.status();
      const progress = parseInt(await contract.totalSupply());
      setStatus(status.toString());
      setProgress(progress);
    });
  };

  useEffect(() => {
    (async () => {
      //读取fullAddress地址
      const fullAddressInStore = get("fullAddress") || null;
      //如果地址存在，获取已mint的数量且保存地址
      if (fullAddressInStore) {

        const { contract } = await connectWallet();
        const numberMinted = await contract.whitelistMinteds(fullAddressInStore);
        setNumberMinted(parseInt(numberMinted));
        setFullAddress(fullAddressInStore);
        updateStatus();
      }
//         subscribe("fullAddress", async () => {
//           const fullAddressInStore = get("fullAddress") || null;
//           setFullAddress(fullAddressInStore);
//          if (fullAddressInStore) {           
//             const { contract } = await connectWallet();
//             const numberMinted = await contract.whitelistMinteds(fullAddressInStore);
//             setNumberMinted(parseInt(numberMinted));
//             updateStatus();
//           }
//         });
    })();
  }, []);

  useEffect(() => {
    try {
      const fullAddressInStore = get("fullAddress") || null;
      if (fullAddressInStore) {
        updateStatus();
      }
    } catch (err) {
      showMessage({
        type: "error",
        title: "获取合约状态失败",
        body: err.message,
      });
    }
  }, []);

  //异步刷新mint数量
    async function refreshStatus() {
      const { contract } = await connectWallet();
      const numberMinted = await contract.whitelistMinteds(fullAddress);
      setNumberMinted(parseInt(numberMinted));
    }

  //默认状态
  let mintButton = (<StyledMintButton　style={{background: "#eee",color: "#999",cursor: "not-allowed",}}>尚未开始</StyledMintButton>);
  //开始白名单mint
  if (status === "1") {
    mintButton = (
      <div style={{display: "flex",}} >
        <MintButton
          onMinted={refreshStatus}
          mintAmount={1}
          style={{ marginRight: "20px" }}
        />
      </div>
    );
  }
  //已mint完
  if (progress >= {maxSupplyWhitlist} || status === "2") {
    mintButton = (<StyledMintButton　style={{background: "#eee",color: "#999",cursor: "not-allowed",}}>全部卖完了</StyledMintButton>);
  }
　
  //达到min上限
  if (numberMinted === 2) {mintButton = (<StyledMintButton　style={{background: "#eee",color: "#999",cursor: "not-allowed",}}>铸造已达上限</StyledMintButton>);}
  //检查是否链接钱包
  if (!fullAddress) {mintButton = (<StyledMintButton style={{background: "#eee",color: "#999",cursor: "not-allowed",}}> 先连接钱包</StyledMintButton>);}
  
  return (<div tyle={{display: "flex", flexDirection: "column",alignItems: "center",}}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        您的钱包： <ConnectWallet />{" "}
        {fullAddress && (
          <span style={{ marginLeft: 10 }}>
            可以铸造 {maxPurchaseWL - numberMinted} 个。
          </span>
        )}
      </div>
      {mintButton}
      <div style={{ marginTop: 20, fontSize: 20, textAlign: "center" }}>
        铸造进度：{progress === null ? "请先连接钱包" : progress} / {maxSupplyWhitlist},价格{mintPrice}ETH，每个钱包最多{maxPurchaseWL}个。
      </div>
    </div>
  );
}

function WhitelistMint() {
  return (
    <Container
      style={{
        background: "#5383b2",
        color: "#fff",
      }}
      id="whitelist-mint"
    >
      <Typography
        style={{ textAlign: "center", marginTop: "5%" }}
        variant="h3"
        gutterBottom
        component="div"
      >
        Whitelist Minting
      </Typography>

      <Content>
        <div
          style={{
            marginTop: 60,
            border: "4px dashed #000",
            padding: "40px",
            borderRadius: 20,
          }}
        >
          <WhiteMintSection />
        </div>
      </Content>

      <Typography
          style={{ textAlign: "center", marginTop: "8%" }}
          variant="h5"
          gutterBottom
          component="div"
        >
          铸造之后
        </Typography>

    </Container>
  );
}

export default WhitelistMint;
