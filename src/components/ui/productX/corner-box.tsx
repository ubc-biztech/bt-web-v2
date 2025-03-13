import React from 'react';

interface CornerBorderWrapperProps {
    children: React.ReactNode;
    selected: boolean;
}

const CornerBorderWrapper: React.FC<CornerBorderWrapperProps> = ({ children, selected }) => {
    const cornerStyle: React.CSSProperties = {
        content: '""',
        position: 'absolute',
        width: '15px',
        height: '15px',
        background: 'transparent',
        border: `1px solid ${selected ? "white" : "#656795"} `,
    };

    return (
        <div style={{ position: 'relative' }}>
            <div
                style={{
                    ...cornerStyle,
                    top: 0,
                    left: 0,
                    borderRight: 'none',
                    borderBottom: 'none',
                }}
            />
            <div
                style={{
                    ...cornerStyle,
                    top: 0,
                    right: 0,
                    borderLeft: 'none',
                    borderBottom: 'none',
                }}
            />
            <div
                style={{
                    ...cornerStyle,
                    bottom: 0,
                    left: 0,
                    borderRight: 'none',
                    borderTop: 'none',
                }}
            />
            <div
                style={{
                    ...cornerStyle,
                    bottom: 0,
                    right: 0,
                    borderLeft: 'none',
                    borderTop: 'none',
                }}
            />
            {children}
        </div>
    );
};

export default CornerBorderWrapper;