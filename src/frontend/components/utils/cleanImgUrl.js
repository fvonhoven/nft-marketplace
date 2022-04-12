export const cleanImgUrl = url => {
  if (!url.includes("https://ipfs.infura.io/ipfs/")) {
    const cleanUrl = url.replace("https://ipfs.infura.io/ipfs", "https://ipfs.infura.io/ipfs/")
    return cleanUrl
  }
  return url
}
