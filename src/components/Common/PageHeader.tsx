interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: HeaderProps) {
  return (
    <span>
      <h2 className="text-white text-xl">{title}</h2>
      <div className="flex items-center justify-between">
        <p className="text-bt-blue-100 font-poppins">{subtitle}</p>
      </div>
    </span>
  );
}
