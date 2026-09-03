import { Sidebar } from "./sidebar";

interface ShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function Shell({ children, title, description }: ShellProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-8 py-4 shrink-0">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
