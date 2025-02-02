import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function useRouteLoading() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleStop = () => setIsLoading(false)

    handleStop() // Set to false on initial load and route change

    return () => {
      handleStop()
    }
  }, []) // Removed unnecessary dependencies

  return isLoading
}

