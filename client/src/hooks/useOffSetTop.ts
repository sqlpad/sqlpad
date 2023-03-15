import { useScroll } from "framer-motion"
import { useEffect, useState } from "react"

// ----------------------------------------------------------------------

type ReturnType = boolean

interface UseScrollOptions extends Omit<ScrollOptions, "container" | "target"> {
  container?: React.RefObject<HTMLElement>
  target?: React.RefObject<HTMLElement>
}

export default function useOffSetTop(top = 100, options?: UseScrollOptions): ReturnType {
  const { scrollY } = useScroll(options)

  const [value, setValue] = useState(false)

  useEffect(
    () =>
      scrollY.onChange((scrollHeight) => {
        if (scrollHeight > top) {
          setValue(true)
        } else {
          setValue(false)
        }
      }),
    [scrollY, top]
  )

  return value
}

// Usage
// const offset = useOffSetTop(100);

// Or
// const offset = useOffSetTop(100, {
//   container: ref,
// });
