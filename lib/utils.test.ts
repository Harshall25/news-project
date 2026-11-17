import { cn } from "./utils"

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("resolves conflicting Tailwind classes, last one wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("text-sm", "text-lg")).toBe("text-lg")
  })

  it("ignores falsey and conditional inputs", () => {
    expect(cn("base", false && "hidden", undefined, null, "extra")).toBe(
      "base extra"
    )
  })

  it("returns an empty string with no inputs", () => {
    expect(cn()).toBe("")
  })
})
