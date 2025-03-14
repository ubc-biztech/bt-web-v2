import { motion } from 'framer-motion';
import React from 'react'

const fadeInUpVariant = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
    },
};

interface ProjectBoxProps {
    children: React.ReactNode;
    className: string;
}

const FadeWrapper: React.FC<ProjectBoxProps> = ({ children, className }) => {
  return (
    <motion.div {...fadeInUpVariant} className={className}>
        {children}
    </motion.div>
  )
}

export default FadeWrapper