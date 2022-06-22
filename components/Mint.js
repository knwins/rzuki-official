import Image from 'next/image';
import Link from 'next/link'
import React,{useState, useEffect} from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import Typography from "@mui/material/Typography";

import { get, subscribe } from "../store";
import Container from "./Container";
import ConnectWallet, { connectWallet } from "./ConnectWallet";
import showMessage from "./showMessage";
import Logo from "./Logo";

const ETHERSCAN_DOMAIN =
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "etherscan.io"
    : "rinkeby.etherscan.io";

const Content = styled.div`
  max-width: 840px;
  margin: 0 auto 5% auto;
  strong {
    color: red;
  }
`;


const myLoader = ({src,width,quality}) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

const StyledMintButton = styled.div`
  display: inline-block;
  width: 140px;
  text-align: center;
  padding: 10px 10px;
  border-radius: 10px;
  color: #000;
  background: "rgba(192,53,64,1)",
  cursor: ${(props) => {
    return props.minting || props.disabled ? "not-allowed" : "pointer";
  }};
  opacity: ${(props) => {
    return props.minting || props.disabled ? 0.5 : 1;
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
          const { signer, contract } = await connectWallet();
          const contractWithSigner = contract.connect(signer);
          const value = ethers.utils.parseEther("0.001");
          const tx = await contractWithSigner.mint({value});
          const response = await tx.wait();
          showMessage({
            type: "success",
            title: "Mint success",
          });
        } catch (err) {
          showMessage({
            type: "error",
            title: "Mint Fail",
            body: err.message,
          });
        }
        props.onMinted && props.onMinted();
        setMinting(false);
      }}
      style={{
         background: "rgba(192,53,64,1)",
        color: "#fff",
        cursor:"pointer",
       // ...props.style,
      }}
    >
    {minting ? "Minting..." : "MINT"}
    </StyledMintButton>
  );
}


function MintSection() {

  //已经mint的数量
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);
  const [mintPrice,setMintPrice]= useState(null);
  const [supply,setSupply]=useState(null);
  const [collects,setCollects]=useState(null);
  const [minted,setMinted]=useState(false);


  async function getContractData() {


    const { contract } = await connectWallet();
    const status = await contract.status();
    const progress = parseInt(await contract.totalSupply());
    //获取mint价格
    const mintPrice = parseInt(await contract.mintPrice())/10**18;
    //发行总量
    const supply = parseInt(await contract.supply());

    //检查是否minted 
    const fullAddress = get("fullAddress");
    if (fullAddress) {
    const minted=await contract.getMinted(fullAddress);
    setMinted(minted);
    }
    setStatus(status);
    setProgress(progress);
    setMintPrice(mintPrice);
    setSupply(supply);
    

　　//设置只显示100条数据
    if (progress>=100){progress=100;}

    if(progress>0){
      var collectsArry=new Array();

      //获取指定tokenID的URI
      const thisBaseURI = await contract.baseURI();
      for (var i = 1; i <= progress; i++) {
        var object=new Object();

        //获取元数据
        const res = await fetch(thisBaseURI+i);
        const json = await res.json();

        //读取合约价格
        const tokenIdPrice = parseInt(await contract.getTokenPrice(i))/10**18;
        object.id=i;
        object.name=json.name;
       // object.imageUrl="https://ikzttp.mypinata.cloud/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/"+i+".png";
        object.imageUrl=json.image;
        object.price=tokenIdPrice;
        collectsArry.push(object);
      }
      setCollects(collectsArry);
    }

    // 在 mint 事件的时候更新数据
    contract.on("Minted", async (event) => {
    const status = await contract.status();
     const progress = parseInt(await contract.totalSupply());
      setStatus(status.toString());
      setProgress(progress);
    });
  }


 async function refreshStatus() {
    const { contract } = await connectWallet();
    //检查是否minted 
    //const fullAddress = get("fullAddress");
   // const minted=await contract.getMinted(fullAddress);
    //setMinted(minted);
  }


   useEffect(() => {
    (async () => {
      const fullAddressInStore = get("fullAddress") || null;
      if (fullAddressInStore) {
        const { contract } = await connectWallet();
        setFullAddress(fullAddressInStore);
      }
      subscribe("fullAddress", async () => {
        const fullAddressInStore = get("fullAddress") || null;
        setFullAddress(fullAddressInStore);
        if (fullAddressInStore) {
          const { contract } = await connectWallet();
          getContractData();
        }
      });
    })();
  }, []);

  
  useEffect(() => {
    try {
      const fullAddressInStore = get("fullAddress") || null;
      if (fullAddressInStore) {
        getContractData();
      }
    } catch (err) {
      showMessage({
        type: "error",
        title: "获取合约状态失败",
        body: err.message,
      });
    }
  }, []);
 
  let mintButton = (
    <StyledMintButton
      style={{
        background: "rgba(174,174,174,1)",
        color: "#fff",
        border:"0",
        cursor: "not-allowed",
      }}
    >
      Wait Mint
    </StyledMintButton>
  );



  if (status === 0) {
    
      mintButton = (<StyledMintButton
        style={{
          background: "rgba(174,174,174,1)",
          color: "#fff",
          width:"180px",
          cursor: "not-allowed",
        }}
      >Waiting mint</StyledMintButton>);
    
  }



  if (status === 1) {
    if (minted) {
      mintButton = (<StyledMintButton
        style={{
          background: "rgba(174,174,174,1)",
          color: "#fff",
          width:"180px",
          cursor: "not-allowed",
        }}
      >Minted</StyledMintButton>);
    }else{
      mintButton = (<MintButton mintAmount={1}  onMinted={refreshStatus}/>);
    }
  }


  if (status === 2) {
    mintButton = (
      <div
        style={{

          display: "flex",
        }}
      >
        Buy On OpenSea
      </div>
    );
  }
 
  if (!fullAddress) {
    mintButton = (
      <StyledMintButton
        style={{
          background: "rgba(174,174,174,1)",
          color: "#fff",
          width:"180px",
          cursor: "not-allowed",
        }}
      >
        please connect wallet
      </StyledMintButton>
    );
  }


  return (
    <div>
    <div style={{
        width: "100%",
        alignItems: "center",
        padding:"40px",
        border:"1px dashed #000",
        borderRadius:"10px",
      }}>

        <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }} >

          <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
           <ConnectWallet />
          </div>
          <div style={{ marginTop: 20, fontSize: 20, textAlign: "center" }}>
          {mintButton}
          </div>
          <div style={{ marginTop: 20, fontSize: 20, textAlign: "center" }}>
            Progress:{progress === null ? "please connect wallet" : progress} / {supply}
          </div>
          <div style={{ marginTop: 20, fontSize: 20, textAlign: "center" }}>
            Mint price：{mintPrice} ETH {minted ? "true" : "false"}
          </div>
        </div>
     </div>


      <div className="collectList">
      <div style={{
                alignItems: "center",
                fontSize:"1.25rem",
                textAlign:"center",
                padding:"20px 0",
              }}>Show Collections</div>
      <ul>
      {collects ===null ? "please wait..." : collects.map((collect) => (
                      <li key={collect.id}> <a target="_blank" href={"https://testnets.opensea.io/assets/rinkeby/0x61752d7b43b7c0fe8b6aa37020effcc0ce55f80a/"+collect.id}><Image
                    loader={myLoader}
                    src={collect.imageUrl}
                    alt={collect.text}
                    width={200}
                    height={200}
                    /></a><div className="text">{collect.name}</div> <div style={{
                alignItems: "center",
                fontSize:"0.75rem",
                textAlign:"center",
                padding:"20px 0",
              }}>{collect.price>0 ? collect.price+"ETH" : "In collection"}</div>
              </li>))}
      </ul>
      </div>
    </div>


    );
}


function Mint(){
    return (
    <Container
      style={{
        background: "#fff",
        color: "#000",
      }}
      id="mint"
    >
      <Typography
        style={{ textAlign: "center", marginTop: "5%" }}
        variant="h3"
        gutterBottom
        component="div"
      >
        <Logo />

      </Typography>

      <Content>
        <Typography
          style={{
            marginTop: "5%",
            textAlign: "center",
          }}
          variant="body1"
          gutterBottom
        >
          Minting
        </Typography>

        <div>
          <MintSection />
        </div>

      </Content>
    </Container>
  );
  
}

export default Mint;

