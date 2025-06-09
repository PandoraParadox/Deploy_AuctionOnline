
module.exports = {
    theme: {
        extend: {
            animation: {
                slide: 'slide 30s linear infinite',
            },
            keyframes: {
                slide: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },
        },
    },
    plugins: [],
};
module.exports = {
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0, transform: 'translateY(-10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
        },
    },
};
