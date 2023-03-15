// @types
import { TranHoverType, TranEnterType, TranExitType } from "../types"

// ----------------------------------------------------------------------

export const varTranHover = (props?: TranHoverType) => {
  const duration = props?.duration || 0.32
  const ease = props?.ease || [0.43, 0.13, 0.23, 0.96]

  return { duration, ease }
}

export const varTranEnter = (props?: TranEnterType) => {
  const duration = props?.durationIn || 0.64
  const ease = props?.easeIn || [0.43, 0.13, 0.23, 0.96]

  return { duration, ease }
}

export const varTranExit = (props?: TranExitType) => {
  const duration = props?.durationOut || 0.48
  const ease = props?.easeOut || [0.43, 0.13, 0.23, 0.96]

  return { duration, ease }
}
