import SuperLearnNFT from "../SuperLearnNFT.cdc"
import NonFungibleToken from 0x1d7e57aa55817448

transaction(recipient: Address, name: String, description: String, thumbnail: String) {
    let minter: &SuperLearnNFT.NFTMinter
    let recipientCollection: &{NonFungibleToken.CollectionPublic}

    prepare(signer: AuthAccount) {
        self.minter = signer.borrow<&SuperLearnNFT.NFTMinter>(from: SuperLearnNFT.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT Minter")

        self.recipientCollection = getAccount(recipient).getCapability(SuperLearnNFT.CollectionPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow a reference to the recipient's collection")
    }

    execute {
        self.minter.mintNFT(
            recipient: self.recipientCollection,
            name: name,
            description: description,
            thumbnail: thumbnail
        )
    }
}
