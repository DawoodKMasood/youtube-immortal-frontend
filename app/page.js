import Image from 'next/image';

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <div aria-hidden="true" class="fixed hidden dark:md:block dark:opacity-70 -top-[80%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12">
        <Image src="/gradients/docs-right.png" class="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-100 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large" alt="docs right background" fill />
      </div>
    </div>
  );
}
