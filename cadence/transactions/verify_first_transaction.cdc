// verify_first_transaction.cdc
// Transaction to verify a user's first blockchain transaction and issue certificate

import SuperLearnActions from 0xf8d6e0586b0a20c7
import NonFungibleToken from 0x1d7e57aa55817448

transaction(userId: String, transactionId: String) {

    let minterRef: &SuperLearnActions.NFTMinter
    let recipientCollectionRef: &{NonFungibleToken.CollectionPublic}

    prepare(acct: AuthAccount) {
        // Get a reference to the NFTMinter resource in the account's storage
        self.minterRef = acct.borrow<&SuperLearnActions.NFTMinter>(from: SuperLearnActions.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")

        // Set up collection if it doesn't exist
        if acct.borrow<&SuperLearnActions.Collection>(from: SuperLearnActions.CollectionStoragePath) == nil {
            // Create a new empty collection
            let collection <- SuperLearnActions.createEmptyCollection()
            
            // Save it to the account
            acct.save(<-collection, to: SuperLearnActions.CollectionStoragePath)

            // Create a public capability for the collection
            acct.link<&{NonFungibleToken.CollectionPublic, SuperLearnActions.SuperLearnActionsCollectionPublic}>(
                SuperLearnActions.CollectionPublicPath,
                target: SuperLearnActions.CollectionStoragePath
            )
        }

        // Get a reference to the recipient's collection
        self.recipientCollectionRef = acct.getCapability(SuperLearnActions.CollectionPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")
    }

    execute {
        // Verify the "First Transaction" skill and issue certificate
        let certificateId = self.minterRef.verifySkillAndIssueCertificate(
            recipient: self.recipientCollectionRef.owner!.address,
            userId: userId,
            skill: "First Transaction",
            transactionId: transactionId
        )

        log("Certificate issued! ID: ".concat(certificateId.toString()))
        log("Skill verified: First Transaction")
        log("Transaction ID: ".concat(transactionId))
    }

    post {
        // Verify the certificate was created and deposited
        self.recipientCollectionRef.getIDs().length > 0: "Certificate was not properly issued"
    }
}