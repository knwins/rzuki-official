import React,{useState, useEffect} from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import { get, subscribe } from "../store";
import Typography from "@mui/material/Typography";
import Navigation from "./Navigation";
import showMessage from "./showMessage";
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils

import ConnectWallet, { connectWallet } from "./ConnectWallet";

//读取常量
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const COLLECTION_SIZE = process.env.NEXT_PUBLIC_COLLECTION_SIZE;
const FREE_AMOUNT = process.env.NEXT_PUBLIC_FREE_AMOUNT;
const PUBLICSALE_AMOUNT=process.env.NEXT_PUBLIC_PUBLICSALE_AMOUNT;

const ETHERSCAN_DOMAIN =
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "etherscan.io"
    : "rinkeby.etherscan.io";

 
//提现
function WithdrawButton(props) {
  return (
    <button type="button" className="ant-btn ant-btn-default 
      text-base px-4 py-2 inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white 
      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 undefined"
          onClick={async () => {
          try {
              const { signer, contract } = await connectWallet();
              const contractWithSigner = contract.connect(signer);
              const tx = await contractWithSigner.withdrawMoney();
              const response = await tx.wait();
                showMessage({
                  type: "success",
                  title: "withdraw success",
                });
          } catch (err) {
              showMessage({
                type: "error",
                title: "error informtion",
                body: err.message,
              });
            }
          }}
      ><span>withdraw</span></button>
  );
}

 




//公售状态修改
function PublicSaleStatusButton(props) {
  return (
    <button type="button" className="ant-btn ant-btn-default 
      text-base px-4 py-2 inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white 
      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 undefined"
          onClick={async () => {
          try {
              const { signer, contract } = await connectWallet();
              const contractWithSigner = contract.connect(signer);
              const tx = await contractWithSigner.setPublicSaleStatus(props.status);
              const response = await tx.wait();
                showMessage({
                  type: "success",
                  title: "success",
                });
          } catch (err) {
              showMessage({
                type: "error",
                title: "error informtion",
                body: err.message,
              });
            }
          }}
      ><span>{props.buttonTxt}</span></button>
  );
}


//FreeMint状态修改
function FreeMintStatusButton(props) {
  return (
    <button type="button" className="ant-btn ant-btn-default 
      text-base px-4 py-2 inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white 
      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 undefined"
          onClick={async () => {
          try {
              const { signer, contract } = await connectWallet();
              const contractWithSigner = contract.connect(signer);
              const tx = await contractWithSigner.setFreeMintStatus(props.status);
              const response = await tx.wait();
                showMessage({
                  type: "success",
                  title: "success",
                });
          } catch (err) {
              showMessage({
                type: "error",
                title: "error informtion",
                body: err.message,
              });
            }
          }}
      ><span>{props.buttonTxt}</span></button>
  );
}





function Admin(){

  const [fullAddress, setFullAddress] = useState(null);
  const [name, setName] = useState(null);
  const [symbol, setSymbol] = useState(null);

   const [amountForPublicSale,setAmountForPublicSale]= useState(null);
  const [totalSupply,setTotalSupply]= useState(null);

  const [publicPrice,setPublicPrice]= useState(null);
  const [publicSalePerMint,setPublicSalePerMint]= useState(null);
   const [publicSaleStatus,setPublicSaleStatus]= useState(null);

  const [freeMintStatus,setFreeMintStatus]= useState(null);
  const [freeMintAmount,setFreeMintAmount]= useState(null);

  //表单定义
  const [baseURI,setBaseURI]= useState("");
  const [quantity,setQuantity]= useState("");
  const [reserveAddress,setReserveAddress]= useState("");
  
  
 
  async function getContractData(fullAddress) {

    //try{

    const { contract } = await connectWallet();
    const name=await contract.name();
    const symbol=await contract.symbol();
     const amountForPublicSale = parseInt(await contract.amountForPublicSale());
    const totalSupply = parseInt(await contract.totalSupply());

    const publicPrice = parseInt(await contract.publicPrice());
    const publicSalePerMint = parseInt(await contract.publicSalePerMint());
     const publicSaleStatus=await contract.publicSaleStatus();

    const freeMintStatus = await contract.freeMintStatus();
    const freeMintAmount = parseInt(await contract.freeMintAmount());

    
    setName(name);
    setSymbol(symbol);
     setAmountForPublicSale(amountForPublicSale);
    setTotalSupply(totalSupply);
 
    setPublicPrice(publicPrice/10**18);
    setPublicSalePerMint(publicSalePerMint);
     setPublicSaleStatus(publicSaleStatus);

    setFreeMintStatus(freeMintStatus);
    setFreeMintAmount(freeMintAmount);

    // } catch (err) {
    //     showMessage({
    //       type: "error",
    //       title: "connect contract error"
    //     });
    //   }

  }

  //读取地址判断
      useEffect(() => {
        (async () => {
            const fullAddressInStore = get("fullAddress") || null;
            
            if (fullAddressInStore && fullAddressInStore!="" && fullAddressInStore!=null) {
                setFullAddress(fullAddressInStore);
                const { contract } = await connectWallet();
            }else{
                showMessage({
                    type: "error",
                    title: "请链接钱包",
                });  
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
        showMessage({
          type: "error",
          title: "获取合约状态失败",
          body: err.message,
        });
      }
    }, []);
  

  //提交BaseURI修改
  const handleSetBaseURI= async (e) => {
      try {
         e.preventDefault()
          const { signer, contract } = await connectWallet();
          const contractWithSigner = contract.connect(signer);
          const tx = await contractWithSigner.setBaseURI(baseURI);
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
  }

  //提交handleAirdrop
  const handleAirdrop= async (e) => {
      try {
         e.preventDefault()
          const { signer, contract } = await connectWallet();
          const contractWithSigner = contract.connect(signer);
          const tx = await contractWithSigner.airdrop(quantity,reserveAddress);
          const response = await tx.wait();
          showMessage({
            type: "success",
            title: "Airdrop success",
           });
      } catch (err) {
        showMessage({
          type: "error",
          title: "Airdrop Fail",
          body: err.message,
        });
      } 
  }

return (
<>
<Navigation />
<div className="w-screen h-screen p-10 pt-20 flex flex-col overflow-x-hidden">
<div className="p-4">
  <div>
    <div className="text-2xl mb-4">当前配置</div>
    <div className="mt-4">
      <div className="ant-descriptions">
        <div className="ant-descriptions-view">
          <table>
            <tbody>
              <tr className="ant-descriptions-row">
                <td className="ant-descriptions-item"><div className="ant-descriptions-item-container"><span className="ant-descriptions-item-label">代币名称</span><span className="ant-descriptions-item-content">{name}</span></div></td>
                <td className="ant-descriptions-item"><div className="ant-descriptions-item-container"><span className="ant-descriptions-item-label">代币符号</span><span className="ant-descriptions-item-content">{symbol}</span></div></td>
                <td className="ant-descriptions-item"><div className="ant-descriptions-item-container"><span className="ant-descriptions-item-label">集合总数</span><span className="ant-descriptions-item-content">{COLLECTION_SIZE}</span></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="ant-descriptions">
        <div className="ant-descriptions-view">
          <table>
            <tbody>
              <tr className="ant-descriptions-row">
                <td className="ant-descriptions-item" ><div className="ant-descriptions-item-container"><span className="ant-descriptions-item-label">公开发售价格</span><span className="ant-descriptions-item-content">{publicPrice}</span></div></td>
                <td className="ant-descriptions-item" ><div className="ant-descriptions-item-container"><span className="ant-descriptions-item-label">公开发售数量</span><span className="ant-descriptions-item-content">{PUBLICSALE_AMOUNT}</span></div></td>
                <td className="ant-descriptions-item" ><div className="ant-descriptions-item-container"><span className="ant-descriptions-item-label">公开发售单笔铸造数目上限</span><span className="ant-descriptions-item-content">{publicSalePerMint}</span></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div className="text-2xl mt-4 mb-4">合约管理</div>
    <div className="my-4">合约地址为：<a href={"https://etherscan.io/address/"+CONTRACT_ADDRESS} 
    target="_blank" rel="noreferrer">{CONTRACT_ADDRESS}</a> </div>
    <div className="text-xl mb-8 mt-4">通用</div>

    <div className="flex items-center gap-x-2 mb-4">
      <div>元数据设置</div>
      <div className="ant-form ant-form-inline">
        <div className="ant-row ant-form-item" style={{rowGap:" 0px"}}>
          <div className="ant-col ant-form-item-label">
                 <label htmlFor="name">URI</label>
          </div>
          <div className="ant-col ant-form-item-control">
            <div className="ant-form-item-control-input">
              <div className="ant-form-item-control-input-content">
                <input placeholder="ipfs or other" name="baseURI" className="ant-input" 
                type="text" 
                value={baseURI} onChange={(e) => setBaseURI(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      <button
      className="ant-btn ant-btn-default 
      text-base px-4 py-2 inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white 
      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 undefined"
      onClick={handleSetBaseURI}
      ><span>setBaseUri</span>
      </button>
     </div>
    </div>


    <div className="flex items-center gap-x-2 mb-4 mt-4">
      <div>空投 <small style={{ color:"red"}}>(数量不包含集合总数)</small></div>
       
      <div className="ant-form ant-form-inline">
        <div className="ant-row ant-form-item" style={{rowGap:" 0px"}}>
          <div className="ant-col ant-form-item-label">
           <label htmlFor="name" >quantities</label>
          </div>
          <div className="ant-col ant-form-item-control">
            <div className="ant-form-item-control-input">
              <div className="ant-form-item-control-input-content">
                <input placeholder="1..." className="ant-input" type="text" 

                value={quantity} onChange={(e) => setQuantity(e.target.value)}
                 />

              </div>
            </div>
          </div>
        </div>
        <div className="ant-row ant-form-item" style={{rowGap:" 0px"}}>
          <div className="ant-col ant-form-item-label">
          <label htmlFor="name" >tos</label>
          </div>
          <div className="ant-col ant-form-item-control">
            <div className="ant-form-item-control-input">
              <div className="ant-form-item-control-input-content">
                <input placeholder="0x..." className="ant-input" type="text"
                value={reserveAddress} onChange={(e) => setReserveAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="ant-btn ant-btn-default 
      text-base px-4 py-2 inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white 
      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 undefined"
      onClick={handleAirdrop}
      ><span>reserve mint</span></button>
    </div>


    <div className="flex items-center gap-x-2 mb-4">
      <div>提款</div>
      <WithdrawButton />
    </div>



      <div className="text-xl mb-4 mt-8">Free Mint</div>
    <div className="flex items-center gap-x-2 mb-4">
      <div>Mint状态：{freeMintStatus ? "Started": "Stoped" }</div>
      <div>剩余数量：{freeMintAmount}</div>
    </div>
    <div className="flex items-center gap-x-2 mb-4">
      <div>开启/关闭Mint</div>
      <FreeMintStatusButton buttonTxt={freeMintStatus? "Free Mint Stop": "Free Mint Start"} status={freeMintStatus? 0: 1} />
    </div>

 
   
    <div className="text-xl mb-4 mt-8">公开售卖</div>
    <div className="flex items-center gap-x-2 mb-4">
      <div>Mint状态：{publicSaleStatus?"Started":"Stoped"}</div>
      <div>剩余数量：{amountForPublicSale}</div>
    </div>
    <div className="flex items-center gap-x-2 mb-4">
      <div>开启/关闭Mint</div>
      <PublicSaleStatusButton buttonTxt={publicSaleStatus? "PublicSale Stop": "PublicSale Start"} status={publicSaleStatus? 0: 1} />
    </div>


  

  </div>
</div>
</div>
</>);
}



export default Admin;

