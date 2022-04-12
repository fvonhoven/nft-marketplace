import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { Row, Col, Card, Button } from "react-bootstrap"
import { cleanImgUrl } from "./utils/cleanImgUrl"

export const Home = ({ marketplace, nft }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const loadMarketplaceItems = useCallback(async () => {
    const itemCount = await marketplace.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i)
      if (!item.sold) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId)
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of item (item price + fee)
        console.log("HEY", item.itemId)
        const totalPrice = await marketplace.getTotalPrice(item.itemId)
        // Add item to items array
        items.push({
          totalPrice,
          itemId: item.id,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        })
      }
    }
    console.log("ITEMS", items)
    setItems(items)
    setLoading(false)
  }, [marketplace, nft])

  const buyMarketItem = async item => {
    console.log("ITEM ID", item)
    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems()
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [loadMarketplaceItems])

  if (loading) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    )
  }

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={cleanImgUrl(item.image)} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  )
}
