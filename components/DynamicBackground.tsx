import React from 'react';

const colorPalettes = [
    ['rgba(126, 34, 206, 0.25)', 'rgba(30, 58, 138, 0.3)', 'rgba(239, 68, 68, 0.2)'], 
    ['rgba(147, 51, 234, 0.25)', 'rgba(250, 204, 21, 0.25)', 'rgba(249, 115, 22, 0.2)'], 
    ['rgba(67, 56, 202, 0.3)', 'rgba(12, 74, 110, 0.3)', 'rgba(236, 72, 153, 0.2)'], 
    ['rgba(109, 40, 217, 0.25)', 'rgba(220, 38, 38, 0.2)', 'rgba(251, 146, 60, 0.25)'], 
];

const blobColors = [
    'bg-purple-600',
    'bg-blue-800',
    'bg-yellow-400',
    'bg-orange-500',
    'bg-red-500',
    'bg-violet-600',
    'bg-cyan-700'
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateRandomStyles = () => {
    
    const [color1, color2, color3] = shuffleArray(colorPalettes[Math.floor(Math.random() * colorPalettes.length)]);
    const auroraStyles = {
        '--pos1': `${Math.random() * 100}% ${Math.random() * 100}%`,
        '--pos2': `${Math.random() * 100}% ${Math.random() * 100}%`,
        '--pos3': `${Math.random() * 100}% ${Math.random() * 100}%`,
        '--color1': color1,
        '--color2': color2,
        '--color3': color3,
    } as React.CSSProperties;

    
    const shuffledColors = shuffleArray(blobColors);
    const blobs = [
        {
            position: { top: `${Math.random() * 20 - 10}%`, left: `${Math.random() * 20 - 10}%` },
            size: `${Math.floor(Math.random() * 200 + 400)}px`,
            color: shuffledColors[0],
            duration: `${Math.floor(Math.random() * 5 + 15)}s`,
            delay: '2s',
        },
        {
            position: { bottom: `${Math.random() * 20 - 10}%`, right: `${Math.random() * 20 - 10}%` },
            size: `${Math.floor(Math.random() * 200 + 300)}px`,
            color: shuffledColors[1],
            duration: `${Math.floor(Math.random() * 5 + 18)}s`,
            delay: `${Math.random() * 5 + 3}s`,
        },
        {
            position: { top: `${Math.random() * 40 + 60}%`, right: `${Math.random() * 30 - 15}%` },
            size: `${Math.floor(Math.random() * 150 + 250)}px`,
            color: shuffledColors[2],
            duration: `${Math.floor(Math.random() * 5 + 20)}s`,
            delay: `${Math.random() * 5 + 5}s`,
        },
    ];

    return { auroraStyles, blobs };
};

const memoizedStyles = generateRandomStyles();

const DynamicBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
    const { auroraStyles, blobs } = memoizedStyles;

    return (
        <div className={`aurora-background ${className || ''}`} style={auroraStyles}>
            <div className="absolute inset-0 z-0 pointer-events-none">
                {blobs.map((blob, i) => (
                    <div
                        key={i}
                        className={`blob ${blob.color}`}
                        style={{
                            ...blob.position,
                            width: blob.size,
                            height: blob.size,
                            animationDuration: blob.duration,
                            animationDelay: blob.delay,
                        }}
                    />
                ))}
            </div>
            {children}
        </div>
    );
};

export default DynamicBackground;