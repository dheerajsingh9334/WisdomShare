import React from "react";
import { motion } from "framer-motion";
import LightningEffect from "./LightningEffect";

const GlobalBackground: React.FC = () => {
  const lightningHue = 220;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-black/80"></div>
        {/* Subtle gradient blob */}
        <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-none bg-gradient-to-b from-blue-500/10 to-purple-600/5 blur-3xl"></div>
        
        {/* Lightning effect layer */}
        <div className="absolute top-0 w-full left-1/2 transform -translate-x-1/2 h-full opacity-40">
          <LightningEffect
            hue={lightningHue}
            xOffset={0}
            speed={1.2}
            intensity={0.4}
            size={1.5}
          />
        </div>

        {/* Radial glow for depth */}
        <div className="z-10 absolute top-[55%] left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] backdrop-blur-3xl rounded-full bg-[radial-gradient(circle_at_25%_90%,_#1e386b_10%,_#00000000_70%)]"></div>
        
        {/* Extra darkness for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
      </motion.div>
    </div>
  );
};

export default GlobalBackground;
