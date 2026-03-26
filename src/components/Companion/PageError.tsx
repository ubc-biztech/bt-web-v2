const PageError = ({
  icon,
  title,
  subtitle,
  message = "An unexpected error occurred.",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  message: string;
}) => (
  <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
    <div className="text-red-500 mb-6">{icon}</div>
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold">{title}</h1>
      <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
      <h2 className="text-2xl font-semibold">{subtitle}</h2>
    </div>
    <p className="mt-8 text-gray-600">{message}</p>
  </div>
);

export default PageError;
