import React,{useState, useEffect} from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import Typography from "@mui/material/Typography";

import { get, subscribe } from "../store";
import Container from "./Container";
import ConnectWallet, { connectWallet } from "./ConnectWallet";
import showMessage from "./showMessage";

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

const StyledMintButton = styled.div`
  display: inline-block;
  width: 140px;
  text-align: center;
  padding: 10px 10px;
  border: 1px solid #000;
  border-radius: 10px;
  color: #000;
  background: #dde4b6;
  cursor: ${(props) => {
    return props.minting || props.disabled ? "not-allowed" : "pointer";
  }};
  opacity: ${(props) => {
    return props.minting || props.disabled ? 0.001 : 1;
  }};
`;


class MintHome extends React.Component{
    constructor() {
        super(); 

        var collectsArry=new Array();
       for (var i = 0; i <= 10; i++) {
            var object=new Object();
            object.text="#"+i;
            object.imageUrl="https://ikzttp.mypinata.cloud/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/"+i+".png";
            collectsArry.push(object);
            }

            this.collects=collectsArry;

    }
    render() {
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
        Uzuki
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
          minting
        </Typography>
        
        <div
          style={{
            marginTop: 60,
            border: "1px dashed #000",
            padding: "40px",
            borderRadius: 10,
          }}
        >
          <MintSection />
        </div>


        <Typography
          style={{
            marginTop: "5%",
            textAlign: "center",
          }}
          variant="body1"
          gutterBottom
        >
          show tokenIDs
          <div class="collectList">
          <ul>  
           {  this.collects.map(function (value, key) {
              return (<li><img src={value.imageUrl} /><div class="text">{value.text}</div></li>);
            })
           }
          </ul>
         </div>
        </Typography>
         
      </Content>
    </Container>
  );
    }
}
export default MintHome;


 

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
            body: (<div>Mint success</div>),
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
        background: "#dde4b6",
        ...props.style,
      }}
    >
      MINT
    </StyledMintButton>
  );
}

 


function MintSection() {
  // 初始设置
  const [status, setStatus] = useState("0");

  //已经mint的数量
  const [progress, setProgress] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);
  const [thisBaseURI,setThisBaseURI]= useState("");
  const [mintPrice,setMintPrice]= useState(null);
  const [tokenIdPrice,setTokenIdPrice]=useState(null);
  const [supply,setSupply]=useState(null);
  
　
  async function getContractData() {
    const { contract } = await connectWallet();
    const status = await contract.status();
    const progress = parseInt(await contract.totalSupply());

    //获取指定tokenID的URI
    const thisBaseURI = await contract.tokenURI(0);

    //获取mint价格
    const mintPrice = parseInt(await contract.mintPrice())/10**18;

    //获取指定tokenID价格
    const tokenIdPrice = parseInt(await contract.getTokenPrice(0))/10**18;

    //发行总量
     const supply = parseInt(await contract.supply());
 
    setStatus(status.toString());
    setProgress(progress);
    setThisBaseURI(thisBaseURI);
    setMintPrice(mintPrice);
    setTokenIdPrice(tokenIdPrice);
    setSupply(supply)


    

    // 在 mint 事件的时候更新数据
    contract.on("Minted", async (event) => {
      const status = await contract.status();
     const progress = parseInt(await contract.totalSupply());
      setStatus(status.toString());
      setProgress(progress);
    });
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
        background: "#eee",
        color: "#999",
        cursor: "not-allowed",
      }}
    >
      Wait Mint
    </StyledMintButton>
  );

  if (status === "1") {
    mintButton = (
      <div
        style={{
          display: "flex",
        }}
      >
        <MintButton
          mintAmount={1}
          style={{ marginRight: "20px" }}
        />    
      </div>
      
    );
  }


  if (status === "2") {
    mintButton = (
      <div
        style={{
          display: "flex",
        }}
      >
        Minted
      </div>
    );
  }
 
  if (!fullAddress) {
    mintButton = (
      <StyledMintButton
        style={{
          background: "#eee",
          color: "#999",
          cursor: "not-allowed",
        }}
      >
        please connect wallet
      </StyledMintButton>
    );
  }


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
       <ConnectWallet />
      </div>
      {mintButton}
      <div style={{ marginTop: 20, fontSize: 20, textAlign: "center" }}>
        Progress:{progress === null ? "please connect wallet" : progress} / {supply}
      </div>
      <div style={{ marginTop: 20, fontSize: 20, textAlign: "center" }}>
        Mint price：{mintPrice} 
      </div>
    </div>
  );
}

 



