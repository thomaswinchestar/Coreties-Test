import Link from "next/link";
import { useRouter } from "next/router";

export default function Navigation() {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center h-16 gap-8">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Coreties
          </h1>
          <div className="flex gap-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              Shipments
            </Link>
            <Link
              href="/companies"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/companies")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              Companies
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
