import Image from "next/image"

export const Loading = () => {
  return (
    <div className="h-full w-full flex justify-center item-center">
      <Image src="/logo.svg" alt="loading" width={100} height={100} className="motion-safe:animate-pulse duration-700" />
    </div>
  )
}