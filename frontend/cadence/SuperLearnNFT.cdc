pub contract SuperLearnNFT {
    pub resource NFT {
        pub let id: UInt64
        pub let metadata: {String: String}

        init(id: UInt64, metadata: {String: String}) {
            self.id = id
            self.metadata = metadata
        }
    }

    pub resource interface NFTReceiver {
        pub fun deposit(token: @NFT)
        pub fun getIDs(): [UInt64]
    }

    pub resource Collection: NFTReceiver {
        pub var ownedNFTs: @{UInt64: NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            return <-token
        }

        pub fun deposit(token: @NFT) {
            self.ownedNFTs[token.id] <-! token
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }
    }

    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    pub resource NFTMinter {
        pub var idCount: UInt64

        init() {
            self.idCount = 1
        }

        pub fun mintNFT(metadata: {String: String}): @NFT {
            let newNFT <- create NFT(id: self.idCount, metadata: metadata)
            self.idCount = self.idCount + 1
            return <-newNFT
        }
    }
}
