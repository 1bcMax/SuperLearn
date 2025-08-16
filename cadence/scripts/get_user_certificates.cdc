// get_user_certificates.cdc
// Script to get all certificates owned by a user

import SuperLearnActions from 0xf8d6e0586b0a20c7
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448

pub struct CertificateInfo {
    pub let id: UInt64
    pub let skill: String
    pub let userId: String
    pub let issuedAt: UFix64
    pub let verificationBlock: UInt64
    pub let transactionId: String

    init(
        id: UInt64,
        skill: String,
        userId: String,
        issuedAt: UFix64,
        verificationBlock: UInt64,
        transactionId: String
    ) {
        self.id = id
        self.skill = skill
        self.userId = userId
        self.issuedAt = issuedAt
        self.verificationBlock = verificationBlock
        self.transactionId = transactionId
    }
}

pub fun main(userAddress: Address): [CertificateInfo] {
    let account = getAccount(userAddress)
    
    // Get the user's collection
    let collectionRef = account
        .getCapability(SuperLearnActions.CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic, SuperLearnActions.SuperLearnActionsCollectionPublic}>()
    
    if collectionRef == nil {
        return []
    }

    let certificates: [CertificateInfo] = []
    
    // Get all certificate IDs
    let ids = collectionRef!.getIDs()
    
    for id in ids {
        // Borrow the certificate
        if let certificate = collectionRef!.borrowSuperLearnActions(id: id) {
            let certInfo = CertificateInfo(
                id: certificate.id,
                skill: certificate.skill,
                userId: certificate.userId,
                issuedAt: certificate.issuedAt,
                verificationBlock: certificate.verificationRecord.blockHeight,
                transactionId: certificate.verificationRecord.transactionId
            )
            certificates.append(certInfo)
        }
    }
    
    return certificates
}