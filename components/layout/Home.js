import Image from 'next/image';
import UserFormComponent from './UserFormComponent';
import ImageLoaderComponent from './ImageLoader';
import Left from "@/assets/docs-left.png"
import Right from "@/assets/docs-right.png"
import Logo from "@/assets/logo.png"

export default function HomeComponent() {
  return (
    <div className="relative flex flex-col items-center px-5">
        <Image src={Logo} width={200} height={200} alt='Logo' priority />
        <div className='flex flex-col gap-5 max-w-[728px] w-full lg:bg-black/20 rounded-xl mb-10 py-5 lg:py-16 px-5 lg:px-20 lg:shadow-xl z-10'>
            <UserFormComponent />
        </div>
        <div className="fixed opacity-70 -bottom-[40%] -left-[20%] z-0">
            <ImageLoaderComponent
            src={Left} 
            className="relative z-10 shadow-black/5 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large" 
            alt="docs left background" 
            />
        </div>
        <div className="fixed opacity-70 -top-[80%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12">
            <ImageLoaderComponent 
            src={Right} 
            className="relative z-10 shadow-black/5 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large" 
            alt="docs right background" 
            />
        </div>
        <div className="fixed bg-gradient-to-br from-[#202020] to-black inset-0 -z-10" />
    </div>
  );
}