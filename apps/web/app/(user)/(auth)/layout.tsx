const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center my-5">
      {children}
    </div>
  );
};

export default AuthLayout;
