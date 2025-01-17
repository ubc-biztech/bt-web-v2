import { FC } from 'react';
import { AnimatedBorder } from '../../ui/animated-border';

interface ResponseSectionProps {
  title: string;
  text?: string;
  list?: string[];
}

const ResponseSection: FC<ResponseSectionProps> = ({ title, text, list }) => {
  return (
    <AnimatedBorder className="w-full mb-3 sm:mb-4">
      <div className="rounded-lg p-3 sm:p-4 font-redhat">
        <p className="text-xs sm:text-sm text-light-grey font-redhat mb-1 sm:mb-2">
          {title}
        </p>
        {list ? (
          <ul className="list-disc list-inside">
            {list.map((item, index) => (
              <li key={index} className="text-xs sm:text-sm font-satoshi mb-1 sm:mb-2">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          text && <p className="font-satoshi">{text}</p>
        )}
      </div>
    </AnimatedBorder>
  );
};

export default ResponseSection;
