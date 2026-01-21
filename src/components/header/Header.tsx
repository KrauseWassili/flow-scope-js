"use client";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-header  overflow-x-hidden">
      {/* Контейнер контента */}
      <div className="mx-auto flex flex-col sm:flex-row items-center px-2">

        {/* LEFT */}
        <div className="flex items-center sm:flex-1 space-x-2">
          <Link href="/">
            <Image
              className="rounded"
              src="/icon-header-64.png"
              alt="flowscopejs"
              width={40}
              height={40}
            />
          </Link>

          <Link
            href="/"
            className="link-btn whitespace-nowrap scale-100!"
          >
            FlowScope JS
          </Link>
        </div>

        {/* CENTER */}
        <nav className="flex w-full sm:w-auto justify-center space-x-4 mt-2 sm:mt-0">
          <Link href="/" className="link-btn">Home</Link>
          <Link href="/app" className="link-btn">App</Link>
          <Link href="/about" className="link-btn">About</Link>
          <Link href="/usage" className="link-btn">Usage</Link>
        </nav>

        {/* RIGHT spacer */}
        <div className="hidden sm:block sm:flex-1" />
      </div>
    </header>
  );
}
