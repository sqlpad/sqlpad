import React from "react";
import { LazyMotion, m } from "framer-motion"

// ----------------------------------------------------------------------

const loadFeatures = () => import("./features.js").then((res) => res.default)

type Props = {
  children: React.ReactNode
}

export default function MotionLazyContainer({ children }: Props) {
  return (
    <LazyMotion strict features={loadFeatures}>
      <m.div style={{ height: "100%" }}> {children} </m.div>
    </LazyMotion>
  )
}
