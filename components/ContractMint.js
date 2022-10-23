import React,{useState, useEffect} from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import { get, subscribe } from "../store";
import Typography from "@mui/material/Typography";
import Image from 'next/image';
import Navigation from "./Navigation";
import showMessage from "./showMessage";
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils

import ConnectWallet, { connectWallet } from "./ConnectWallet";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
const OPENSEA_HTTPS = process.env.NEXT_PUBLIC_OPENSEA_HTTPS
const COLLECTION_SIZE = process.env.NEXT_PUBLIC_COLLECTION_SIZE;
const PUBLICSALE_AMOUNT = process.env.NEXT_PUBLIC_PUBLICSALE_AMOUNT;
const FREE_AMOUNT= process.env.NEXT_PUBLIC_FREE_AMOUNT;


const OPENSEA_HTTPS_TOKEN = process.env.NEXT_PUBLIC_CHAIN_ID === "1"
? "https://x2y2.io/eth/"+CONTRACT_ADDRESS+"/"
: "https://x2y2.io/eth/rinkeby/"+CONTRACT_ADDRESS+"/"

const myLoader = ({src,width,quality}) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

//连接状态提示
let connectStatusTip=false;


function ContractShow(){

    return (
        <>
        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8 contract-bg"
        >
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        <span className="block" style={{"fontFamily":"MarkerFelt","color":"#000000","fontSize":"40px",
        "lineHeight":"40px",}}>
        RZuKi NFT</span>
        </h2>

        <div className="mx-auto text-left contract-info">
        <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.5rem","fontWeight":"300"}}>
        Rzuki is a brand.</p>

        <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.5rem",}}>
        A new kind of brand that we build together.</p>

        <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.5rem",}}>A brand for the metaverse. By the community.</p>

        <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.7rem",}}>
        A collection of 1,888 avatars that give you membership access to The Garden. 
        It starts with exclusive streetwear collabs, NFT drops, live events, and much more that will be revealed over time. 
        Community ownership in Rzuki allows for a new genre of media which the world has yet to explore. An Rzuki is your identity in the metaverse — let&apos;s build together.
        </p>
        
        <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.7rem",}}>
        The Garden is a corner of the internet where art, community, and culture fuse to create magic. The lines between the physical and digital worlds are blurring and the rules are being rewritten.
        </p>

        <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.5rem",}}>
         Collection Size:1888
        </p>

         
<p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.5rem",}}>
         Airdrop Mint Size:30 
        </p>

         <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.5rem",}}>
         Free Mint Size:858 
        </p>
         <p className="mt-4 text-lg leading-6 text-indigo-200" 
        style={{"fontFamily":"Noteworthy-Light","color":"#000000","fontSize":"1erm",
        "lineHeight":"1.5rem",}}>
        Public Sale Size:1000 ; Price:0.0069 ETH
        </p>
        </div>

        <div className="contract-image mx-auto">
        <img src="/girl_bg.png" className="mx-auto" />
        </div>
        </div>
        </>
        );
        
    }



function PublicSaleFun(){

    const [fullAddress,setFullAddress]=useState(null);
    const [amountForPublicSale,setAmountForPublicSale]= useState(null);
    const [publicPrice,setPublicPrice]= useState(null);
    const [publicSalePerMint,setPublicSalePerMint]= useState(null);
    const [publicSaleStatus,setPublicSaleStatus]= useState(null);
    const [publicSaleQuantity,setPublicSaleQuantity]= useState(1);
    const [allowListStock,setAllowListStock]=useState(0);
    const [maxPerAddressDuringMint,setMaxPerAddressDuringMint]= useState(null);
    
    const [allowListMinted,setAllowListMinted]= useState(0);
    

    //mint总数
    const [numberMinted,setNumberMinted]=useState(0);

 　//读取合约数据
 async function getContractData(fullAddress) {
     try{
        const { contract } = await connectWallet();
        const amountForPublicSale = parseInt(await contract.amountForPublicSale());
        const publicPrice = parseInt(await contract.publicPrice());
        const publicSalePerMint = parseInt(await contract.publicSalePerMint());
        const publicSaleStatus=await contract.publicSaleStatus();
        const maxPerAddressDuringMint=await contract.maxPerAddressDuringMint();
        const numberMinted=await contract.numberMinted(fullAddress);

        setAmountForPublicSale(amountForPublicSale);
        setPublicPrice(publicPrice/10**18);
        setPublicSalePerMint(publicSalePerMint);
        setPublicSaleStatus(publicSaleStatus);
        setMaxPerAddressDuringMint(maxPerAddressDuringMint);
        setNumberMinted(numberMinted);
        
        if (fullAddress) {
            const numberMinted= parseInt(await contract.numberMinted(fullAddress));
            setNumberMinted(numberMinted);
            //处理白名单
            const  allowListAppeared=await contract.allowListAppeared(fullAddress)
            if (allowListAppeared) {
                const allowListStock= parseInt(await contract.allowListStock(fullAddress));
                setAllowListStock(allowListStock);
                setAllowListMinted(maxPerAddressDuringMint-allowListStock);
            }else{
                setAllowListStock(maxPerAddressDuringMint);
                setAllowListMinted(0);
            }
        }

    } catch (err) {
        if (!connectStatusTip) {
            showMessage({
                type: "error",
                title: "Contract Network Connect Failed",
                body: err.message,
            });
            connectStatusTip=true;
        }
    }

}


     //读取地址判断
     useEffect(() => {
        (async () => {
            const fullAddressInStore = get("fullAddress") || null;
            
            if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
                setFullAddress(fullAddressInStore);
                const { contract } = await connectWallet();
            }
            subscribe("fullAddress", async () => {
                const fullAddressInStore = get("fullAddress") || null;
                if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
                   setFullAddress(fullAddressInStore);
                   const { contract } = await connectWallet();
                   getContractData(fullAddressInStore);
               }
           });
        })();
    }, []);

     
     useEffect(() => {
      try {
        const fullAddressInStore = get("fullAddress") || null;
        if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
          setFullAddress(fullAddressInStore);
          getContractData(fullAddressInStore);
      }
  } catch (err) {
   if (!connectStatusTip) {
    showMessage({
        type: "error",
        title: "Contract Network Connect Failed",
        body: err.message,
    });
    connectStatusTip=true;
}
}
}, []);


    //点击handPublicSaleLeftClick
    const handPublicSaleLeftClick= async (e) => {
      try {
          e.preventDefault();
          if (publicSaleQuantity>1 && publicSaleQuantity<=publicSalePerMint) {
            setPublicSaleQuantity(publicSaleQuantity-1);
        }
    } catch (err) {
        showMessage({
          type: "error",
          title: "error informtion",
          body:err.message,
      });
    } 
}

    //点击handPublicSaleRightClick
    const handPublicSaleRightClick= async (e) => {
      try {
          e.preventDefault();

          if (publicSaleQuantity>=1 && publicSaleQuantity<publicSalePerMint) {
           setPublicSaleQuantity(publicSaleQuantity+1);
       }
       
   } catch (err) {
    showMessage({
      type: "error",
      title: "error informtion",
      body:err.message,
  });
} 
}


  //handlePublicSale
  const handlePublicSale= async (e) => {
      try {
       e.preventDefault()

       if (!publicSaleStatus) {
        showMessage({
            type: "informtion",
            title: "wait public sale",
        });
        return;
    }

    if ((numberMinted-allowListMinted)>=publicSalePerMint) {
        showMessage({
            type: "informtion",
            title: "you buy max limit",
        });
        return;
    }
            //计算mint总金额
            const paymentETH =publicSaleQuantity*publicPrice;
            //4.Mint
            const { signer, contract } = await connectWallet();
            const contractWithSigner = contract.connect(signer);
            const value = ethers.utils.parseEther(paymentETH.toString());
            const tx = await contractWithSigner.publicSaleMint(publicSaleQuantity,{value,});
            const response = await tx.wait();
            showMessage({
                type: "success",
                title: "public sale buy success",
            });
            return;
        } catch (err) {
            showMessage({
              type: "error",
              title: "error informtion",
              body: err.message,
          });
        } 
    }
    

    return (

        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8" style={{"fontFamily":"Noteworthy-Light",}}>
        <h2 className="text-3xl tracking-tight text-gray-900 sm:text-4xl">
        <span className="block">Public Sale</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-indigo-200" style={{"color":"#000"}} >
        <span className="px-4">Public Sale Price:{publicPrice}ETH</span>
        </p>

        <div className="mt-4 mb-4 text-lg leading-6 text-indigo-200" style={{"color":"#000","fontSize":"1rem"}}>
        {PUBLICSALE_AMOUNT-amountForPublicSale} / {PUBLICSALE_AMOUNT}
        </div>
        <div className="text-lg" style={{"color":"#000"}}>
        <div className="flex items-center justify-center gap-x-2">
        <button type="button" onClick={handPublicSaleLeftClick} className="ant-btn ant-btn-default ant-btn-icon-only ant-btn-background-ghost"
        ant-click-animating-without-extra-node="false" style={{"width":"22px","height":"22px","background":"#b7323d"}}>
        <span role="img" aria-label="minus" className="anticon anticon-minus" style={{"color":"#fff"}}>
        <svg viewBox="64 64 896 896" focusable="false" data-icon="minus" width="1em"
        height="1em" fill="currentColor" aria-hidden="true">
        <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z">
        </path>
        </svg>
        </span>
        </button>
        <div className="ml-4 mr-4" style={{"color":"#000","fontSize":"1.5rem"}}>
        <input type="text" style={{"width":"120px"}} value={publicSaleQuantity} 
        className="ant-input text-center" onChange={(e) => setPublicSaleQuantity(1)} />
        </div>

        <button type="button" onClick={handPublicSaleRightClick} className="ant-btn ant-btn-default ant-btn-icon-only ant-btn-background-ghost"
        ant-click-animating-without-extra-node="false" style={{"width":"22px","height":"22px","background":"#b7323d"}}>
        <span role="img" aria-label="plus"  className="anticon anticon-plus">
        <svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em"
        height="1em" fill="currentColor" aria-hidden="true" style={{"color":"#fff"}}>
        <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
        <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
        </svg>
        </span>
        </button>
        </div>
        </div>

        <div className="mt-4 ml-4 mr-4" style={{"color":"#000","fontSize":"0.75rem"}}>
        You Buy { numberMinted>0?(numberMinted- allowListMinted):"0" }
        </div>
        <div className="mt-4 flex justify-center" onClick={handlePublicSale}>
        <div className="inline-flex rounded-md shadow">
        <a className="inline-flex items-center justify-center px-6 py-2 border 
        border-transparent text-base rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        style={{ "background":"#b7323d","color":"#fff"}}> {publicSaleStatus ? "Public Sale" :"Wait Public Sale"}</a>
        </div>
        </div>
        </div>
        

        );
    }




function FreeMintFun(){

    const [fullAddress,setFullAddress]=useState(null);
    const [freeMintAmount,setFreeMintAmount]= useState(0);
    const [maxFreeMint,setMaxFreeMint]= useState(null);
    const [freeMintStatus,setFreeMintStatus]= useState(null);
    const [freeQuantity,setFreeQuantity]= useState(1);
    const [freeAppeared,setFreeAppeared]= useState(0);
    const [freeStock,setFreeStock]= useState(0);

 　//读取合约数据
 async function getContractData(fullAddress) {
     try{
        const { contract } = await connectWallet();
        const freeMintAmount= parseInt(await contract.freeMintAmount());
        const maxFreeMint = parseInt(await contract.maxFreeMint());
        const freeMintStatus=await contract.freeMintStatus();

        setFreeMintAmount(freeMintAmount);
        setMaxFreeMint(maxFreeMint);
        setFreeMintStatus(freeMintStatus);

        if (fullAddress) {
        const  freeAppeared=await contract.freeAppeared(fullAddress)
        if (freeAppeared) {
            const freeStock= parseInt(await contract.freeStock(fullAddress));
                setFreeStock(freeStock);
            }else{
                setFreeStock(maxFreeMint);
            }
        }

    } catch (err) {
        if (!connectStatusTip) {
            showMessage({
                type: "error",
                title: "Contract Network Connect Failed",
                body: err.message,
            });
            connectStatusTip=true;
        }
    }

}


     //读取地址判断
     useEffect(() => {
        (async () => {
            const fullAddressInStore = get("fullAddress") || null;
            
            if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
                setFullAddress(fullAddressInStore);
                const { contract } = await connectWallet();
            }
            subscribe("fullAddress", async () => {
                const fullAddressInStore = get("fullAddress") || null;
                if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
                   setFullAddress(fullAddressInStore);
                   const { contract } = await connectWallet();
                   getContractData(fullAddressInStore);
               }
           });
        })();
    }, []);

     
     useEffect(() => {
      try {
        const fullAddressInStore = get("fullAddress") || null;
        if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
          setFullAddress(fullAddressInStore);
          getContractData(fullAddressInStore);
      }
  } catch (err) {
   if (!connectStatusTip) {
    showMessage({
        type: "error",
        title: "Contract Network Connect Failed",
        body: err.message,
    });
    connectStatusTip=true;
}
}
}, []);


    //点击handPublicSaleLeftClick
    const handFreeLeftClick= async (e) => {
      try {
          e.preventDefault();
          if (freeQuantity>1 && freeQuantity<=maxFreeMint) {
            setFreeQuantity(freeQuantity-1);
        }
    } catch (err) {
        showMessage({
          type: "error",
          title: "error informtion",
          body:err.message,
      });
    } 
}

    //点击handPublicSaleRightClick
    const handFreeRightClick= async (e) => {
      try {
          e.preventDefault();

          if (freeQuantity>=1 && freeQuantity<maxFreeMint) {
           setFreeQuantity(freeQuantity+1);
       }
       
   } catch (err) {
    showMessage({
      type: "error",
      title: "error informtion",
      body:err.message,
  });
} 
}


  //handleFreeMint
  const handleFreeMint= async (e) => {
      try {
            e.preventDefault()

            if (!freeMintStatus) {
            showMessage({
                type: "informtion",
                title: "wait free mint",
            });
            return;
            }

            if (freeQuantity>=freeStock) {
                showMessage({
                    type: "informtion",
                    title: "you minted max limit",
                });
                return;
            }


            //计算mint总金额
            //4.Mint
            const { signer, contract } = await connectWallet();
            const contractWithSigner = contract.connect(signer);
            const value = ethers.utils.parseEther("0");
            const tx = await contractWithSigner.freeMint(freeQuantity,{value,});
            const response = await tx.wait();
            showMessage({
                type: "success",
                title: "free mint success",
            });
            return;
        } catch (err) {
            showMessage({
              type: "error",
              title: "error informtion",
              body: err.message,
          });
        } 
    }
    

    return (

        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8" style={{"fontFamily":"Noteworthy-Light",}}>
        <h2 className="text-3xl tracking-tight text-gray-900 sm:text-4xl">
        <span className="block">Twitter follows more than 500 start free mint</span>
        </h2>


        <p className="mt-4 text-lg leading-6 text-indigo-200" style={{"color":"#000"}} >
        <span className="px-4">Max free mint 2 </span>
        </p>

        <div className="mt-4 mb-4 text-lg leading-6 text-indigo-200" style={{"color":"#000","fontSize":"1rem"}}>
        {FREE_AMOUNT-freeMintAmount} / {FREE_AMOUNT}
        </div>
        <div className="text-lg" style={{"color":"#000"}}>
        <div className="flex items-center justify-center gap-x-2">
        <button type="button" onClick={handFreeLeftClick} className="ant-btn ant-btn-default ant-btn-icon-only ant-btn-background-ghost"
        ant-click-animating-without-extra-node="false" style={{"width":"22px","height":"22px","background":"#b7323d"}}>
        <span role="img" aria-label="minus" className="anticon anticon-minus" style={{"color":"#fff"}}>
        <svg viewBox="64 64 896 896" focusable="false" data-icon="minus" width="1em"
        height="1em" fill="currentColor" aria-hidden="true">
        <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z">
        </path>
        </svg>
        </span>
        </button>
        <div className="ml-4 mr-4" style={{"color":"#000","fontSize":"1.5rem"}}>
        <input type="text" style={{"width":"120px"}} value={freeQuantity} 
        className="ant-input text-center" onChange={(e) => setFreeQuantity(1)} />
        </div>

        <button type="button" onClick={handFreeRightClick} className="ant-btn ant-btn-default ant-btn-icon-only ant-btn-background-ghost"
        ant-click-animating-without-extra-node="false" style={{"width":"22px","height":"22px","background":"#b7323d"}}>
        <span role="img" aria-label="plus"  className="anticon anticon-plus">
        <svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em"
        height="1em" fill="currentColor" aria-hidden="true" style={{"color":"#fff"}}>
        <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
        <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
        </svg>
        </span>
        </button>
        </div>
        </div>

        <div className="mt-4 ml-4 mr-4" style={{"color":"#000","fontSize":"0.75rem"}}>
        You Free Minted {maxFreeMint-freeStock}
        </div>
        <div className="mt-4 flex justify-center" onClick={handleFreeMint}>
        <div className="inline-flex rounded-md shadow">
        <a className="inline-flex items-center justify-center px-6 py-2 border 
        border-transparent text-base rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        style={{ "background":"#b7323d","color":"#fff"}}> {freeMintStatus ? "Free Mint" :"Coming soon"}</a>
        </div>
        </div>
        </div>
        

        );
    }


    function CollectionList(){

        const [fullAddress,setFullAddress]=useState(null);
        const [totalSupply,setTotalSupply]=useState(0);
        const [collectionList,setCollectionList]=useState(null);

        //读取合约数据
        async function getContractData(fullAddress) {

            try{
                const { contract } = await connectWallet();
                const totalSupply = parseInt(await contract.totalSupply());
                setTotalSupply(totalSupply);

        //设置只显示100条数据
        if (totalSupply>=100){totalSupply=100;}

        if(totalSupply>0){
            var collectionArray=new Array();
            const thisBaseURI = await contract.baseTokenURI();
            for (var i = 0; i < totalSupply; i++) {
                var object=new Object();
                //获取元数据
                const res = await fetch(thisBaseURI+i);
                const json = await res.json();
                object.id=i;
                object.name="#"+i;
                object.imageUrl=json.image;
                collectionArray.push(object);
            }
            setCollectionList(collectionArray);
        }


    } catch (err) {


        if (!connectStatusTip) {
            showMessage({
                type: "error",
                title: "Contract Network Connect Failed",
                body: err.message,
            });
            connectStatusTip=true;
        }
    }
}



      //读取地址判断
      useEffect(() => {
        (async () => {
            const fullAddressInStore = get("fullAddress") || null;
            if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
                setFullAddress(fullAddressInStore);
                const { contract } = await connectWallet();
            }
            subscribe("fullAddress", async () => {
                const fullAddressInStore = get("fullAddress") || null;
                if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
                   setFullAddress(fullAddressInStore);
                   const { contract } = await connectWallet();
                   getContractData(fullAddressInStore);
               }
           });
        })();
    }, []);

      
      useEffect(() => {
          try {
            const fullAddressInStore = get("fullAddress") || null;
            if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
              setFullAddress(fullAddressInStore);
              getContractData(fullAddressInStore);
          }
      } catch (err) {
        if (!connectStatusTip) {
            showMessage({
                type: "error",
                title: "Contract Network Connect Failed",
                body: err.message,
            });
            connectStatusTip=true;
        }
    }
}, []);

      return(
        <>
        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8" style={{"fontFamily":"Noteworthy-Light",}}>
        <div className="collectList">
        <div style={{
            alignItems: "center",
            fontSize:"1.25rem",
            textAlign:"center",
            padding:"20px 0",
        }}>Show Collections
        </div>
        <ul>
        {collectionList ===null ? "" : collectionList.map((collection) => (
        <li key={collection.id}> <a href={OPENSEA_HTTPS_TOKEN+collection.id} target="_blank" rel="noreferrer"><Image
        loader={myLoader}
        src={collection.imageUrl}
        alt={collection.text}
        width={300}
        height={300}
        /></a><div className="text">{collection.name}</div>
        </li>))}
        </ul>
        </div>
        </div>
        </>);
    }
    　

    function Home(){

      return (
      <>
      　<ContractShow />
      <FreeMintFun />
      <CollectionList />
      </>
      );
  }

  export default Home;
