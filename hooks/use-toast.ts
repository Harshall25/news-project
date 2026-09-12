"use client"

import { useCallback } from "react"
import { toast, type ExternalToast } from "sonner"

type ToastType = "success" | "error" | "info" | "loading" | "default"

interface ShowToastOptions extends ExternalToast {
  type?: ToastType
}

export function useToast() {
  const showToast = useCallback(
    (message: string, options: ShowToastOptions = {}) => {
      const { type = "default", duration = 15000, ...rest } = options

      switch (type) {
        case "success":
          return toast.success(message, { duration, ...rest })
        case "error":
          return toast.error(message, { duration, ...rest })
        case "info":
          return toast.info(message, { duration, ...rest })
        case "loading":
          return toast.loading(message, { duration, ...rest })
        default:
          return toast(message, { duration, ...rest })
      }
    },
    []
  )

  const dismiss = useCallback((id?: string | number) => {
    toast.dismiss(id)
  }, [])

  return { showToast, dismiss }
}