import Image from 'next/image';

function Logo(){
return (<>
      <Image
        src="/logo.svg"
        alt="RZuki"
        width={183}
        height={36}
        className="logo"
      />
  </>)
};
export default Logo;

 