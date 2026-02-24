// Animation presets for the website
// These can be selected from the admin panel

export const animations = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    slide: {
        initial: { x: -50, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 50, opacity: 0 }
    },
    slideUp: {
        initial: { y: 30, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -30, opacity: 0 }
    },
    zoom: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.1, opacity: 0 }
    },
    bounce: {
        initial: { y: -30, opacity: 0 },
        animate: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
        exit: { y: 30, opacity: 0 }
    },
    none: {
        initial: {},
        animate: {},
        exit: {}
    }
};

export const speeds = {
    slow: 0.8,
    normal: 0.5,
    fast: 0.25
};

// Helper function to get animation config
export const getAnimationConfig = (animationType, speed = 'normal') => {
    const animation = animations[animationType] || animations.fade;
    const duration = speeds[speed] || speeds.normal;
    const transition = {
        duration,
        ease: "easeOut",
        ...(animation.animate?.transition || {})
    };

    return {
        initial: animation.initial,
        animate: {
            ...animation.animate,
            transition,
        },
        exit: animation.exit,
    };
};

// Stagger children animation
export const staggerContainer = (staggerDelay = 0.1) => ({
    animate: {
        transition: {
            staggerChildren: staggerDelay
        }
    }
});

// Page transition variants
export const pageTransition = (speed = 'normal') => ({
    initial: { opacity: 0 },
    animate: { 
        opacity: 1,
        transition: { duration: speeds[speed] }
    },
    exit: { 
        opacity: 0,
        transition: { duration: speeds[speed] * 0.5 }
    }
});

// Slideshow transition variants
export const slideshowTransition = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
};
