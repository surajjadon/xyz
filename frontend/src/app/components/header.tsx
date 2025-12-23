import Link from 'next/link';
export default function Header() {         
  return (
    <header className="w-full bg-[#F7FCFF] border-b border-slate-200 shrink-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          <div className="flex-1 flex justify-start">
            <Link href="/">
              <h1 className="text-[#00A3FF] font-bold text-2xl cursor-pointer tracking-tight">
                Senior
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-700">
            <Link href="/cm-sheet" className="hover:text-[#00A3FF] transition-colors">CM Sheet</Link>
            <Link href="/blog" className="hover:text-[#00A3FF] transition-colors">Blog</Link>
            <Link href="/ask-code" className="hover:text-[#00A3FF] transition-colors">Ask Code</Link>
            <Link href="/qa" className="hover:text-[#00A3FF] transition-colors">QA</Link>
          </nav>

          <div className="flex-1 flex justify-end">
            <Link 
              href="/profile" 
              className="inline-block bg-[#00A3FF] hover:bg-sky-600 text-white px-6 py-2 rounded font-semibold text-sm shadow-sm transition-colors"
            >
              Log in
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}