"use client"
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <div className="flex items-center bg-header">
      {/* LEFT */}
      <div className="flex-1 flex items-center pl-2">
        <Link href="/">
          <Image
            className="rounded"
            src="/icon-header-64.png"
            alt="flowscopejs"
            width={48}
            height={48}
          />
        </Link>

        <Link href="/" className="link-btn scale-100!">
          FlowScope JS
        </Link>
      </div>
      {/* CENTER */}
      <div className="flex space-x-6 justify-center">
        <Link href="/" className="link-btn">
          Home
        </Link>
        <Link href="/app" className="link-btn">
          App
        </Link>
        <Link href="/about" className="link-btn">
          About
        </Link>
        <Link href="/usage" className="link-btn">
          Usage
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex-1" />
    </div>
  );
}
