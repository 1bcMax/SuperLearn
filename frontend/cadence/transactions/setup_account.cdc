import SuperLearnNFT from "../SuperLearnNFT.cdc"
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

transaction {
    prepare(signer: AuthAccount) {
        if signer.borrow<&SuperLearnNFT.Collection>(from: SuperLearnNFT.CollectionStoragePath) == nil {
            let collection <- SuperLearnNFT.createEmptyCollection()
            signer.save(<-collection, to: SuperLearnNFT.CollectionStoragePath)
            signer.link<&SuperLearnNFT.Collection{NonFungibleToken.CollectionPublic, SuperLearnNFT.CollectionPublicPath, MetadataViews.ResolverCollection}>(SuperLearnNFT.CollectionPublicPath, target: SuperLearnNFT.CollectionStoragePath)
        }
    }
}
