import { ReactNode } from "react";

const UserLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <header className="h-24 bg-gray-100"></header>
      <main className="flex-1">{children}</main>
      <footer className="h-40 bg-red-200"></footer>
    </>
  );
};

export default UserLayout;
