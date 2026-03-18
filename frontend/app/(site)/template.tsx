"use client"

import { motion } from "framer-motion"

const curtain = {
  initial: {
    clipPath: "inset(0 0 100% 0)",
    opacity: 0,
  },
  animate: {
    clipPath: "inset(0 0 0% 0)",
    opacity: 1,
  },
  transition: {
    clipPath: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    opacity: { duration: 0.4, ease: "easeOut" as const },
  },
}

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={curtain.initial}
      animate={curtain.animate}
      transition={curtain.transition}
    >
      {children}
    </motion.div>
  )
}
