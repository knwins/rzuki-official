import Image from 'next/image';

export default function(){
return (<>
      <Image
        src="/logo.svg"
        alt="Uzuki"
        width={244}
        height={48}
        className="logo"
      />
  </>)
};

 