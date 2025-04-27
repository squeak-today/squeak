import React from 'react';

interface ImageProps {
  image_src: string;
}

function CenterContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      {children}
    </div>
  )
} 

const SmallImage : React.FC<ImageProps> = ({ image_src }) => {
  return (
    <img className="w-[50%]" src={image_src}/>
  )
} 

const FullImage : React.FC<ImageProps> = ({ image_src }) => {
  return (
    <img className="w-full" src={image_src}/>
  )
}

function Button({ children } : { children: React.ReactNode }) {
  return <button className="border-none px-4 py-2 rounded-lg font-secondary text-sm bg-[var(--color-item-background)] hover:opacity-90 transition-opacity">{children}</button>
}

function Header({ children } : { children: React.ReactNode }) { return <h1 className="font-primary">{children}</h1> }
function PText({ children } : { children: React.ReactNode }) { return <p className="font-secondary">{children}</p> }

export {
  Header,
  PText,
  Button,
  CenterContent,
  SmallImage,
  FullImage
}
