"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative py-12 bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-6">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Panupongwebstore Logo" className="h-12 w-auto object-contain mx-auto" />
          </Link>
        </div>
        
        <p className="text-gray-500 text-sm mb-4">
          © 2026 Panupongwebstore สงวนลิขสิทธิ์
        </p>

        <div className="flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="text-gray-400 hover:text-neon-cyan transition-colors">
            นโยบายความเป็นส่วนตัว
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-neon-cyan transition-colors">
            เงื่อนไขการใช้งาน
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-neon-cyan transition-colors">
            ติดต่อเรา
          </Link>
        </div>
      </div>
    </footer>
  );
}
