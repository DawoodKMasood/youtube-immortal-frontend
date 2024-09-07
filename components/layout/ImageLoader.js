'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ImageLoaderComponent({ src, alt, className }) {
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    setDataLoaded(true);
  }, []);

  return (
    <Image 
      src={src} 
      className={`${className} ${dataLoaded ? 'opacity-100' : 'opacity-0'}`} 
      alt={alt} 
    />
  );
}