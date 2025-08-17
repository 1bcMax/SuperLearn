access(all) contract SuperLearnNFT {
    access(all) resource NFT {
        access(all) let id: UInt64
        access(all) let metadata: {String: String}

        init(id: UInt64, metadata: {String: String}) {
            self.id = id
            self.metadata = metadata
        }
    }

    access(all) resource interface NFTReceiver {
        access(all) fun deposit(token: @NFT)
        access(all) fun getIDs(): [UInt64]
    }

    access(all) resource Collection: NFTReceiver {
        access(all) var ownedNFTs: @{UInt64: NFT}

        init() {
            self.ownedNFTs <- {}
        }

        access(all) fun withdraw(withdrawID: UInt64): @NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID)!
            return <-token
        }

        access(all) fun deposit(token: @NFT) {
            self.ownedNFTs[token.id] <-! token
        }

        access(all) fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }
    }

    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    access(all) resource NFTMinter {
        access(all) var idCount: UInt64

        init() {
            self.idCount = 1
        }

        access(all) fun mintNFT(metadata: {String: String}): @NFT {
            let newNFT <- create NFT(id: self.idCount, metadata: metadata)
            self.idCount = self.idCount + 1
            return <-newNFT
        }
    }

    init() {
        // Save the NFTMinter resource to the deploying account's storage
        self.account.storage.save(<-create NFTMinter(), to: /storage/NFTMinter)
        
        // Create a public capability for the NFTMinter
        let capability = self.account.capabilities.storage.issue<&NFTMinter>(/storage/NFTMinter)
        self.account.capabilities.publish(capability, at: /public/NFTMinter)
    }
}