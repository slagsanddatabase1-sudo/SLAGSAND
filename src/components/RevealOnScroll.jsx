import React from 'react';
import { motion } from 'framer-motion';

const RevealOnScroll = ({ children, direction = 'up', delay = 0, className = "" }) => {
    // Define animation variants based on direction
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
            x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1], // Smooth ease-out
                delay: delay,
            }
        }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }} // Trigger slightly before fully in view
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default RevealOnScroll;
