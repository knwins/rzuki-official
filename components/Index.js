import Navigation from "./Navigation";
import ContractMint from "./ContractMint";

function Index(){
    return (
    <>
    <div className="overflow-y-scroll pt-20 main">
      <Navigation />
      <ContractMint />
      <div className="banner-image">
      <img src="/banner.png" />
      </div>
    </div>
     </>
  );
  
}

export default Index;

