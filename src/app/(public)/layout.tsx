export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex w-full min-w-0 flex-col">{children}</div>;
}
