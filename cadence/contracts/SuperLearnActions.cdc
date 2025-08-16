// SuperLearnActions.cdc
// Flow Action for verifying crypto learning skills and issuing certificates

import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x1654653399040a61

pub contract SuperLearnActions: NonFungibleToken {
    
    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event SkillVerified(userId: String, skill: String, transactionId: String)
    pub event CertificateIssued(certificateId: UInt64, recipient: Address, skill: String)

    // Named Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    // Contract state
    pub var totalSupply: UInt64
    access(self) var skillVerifications: {String: SkillRecord}
    access(self) var userCertificates: {Address: [UInt64]}

    // Skill verification record
    pub struct SkillRecord {
        pub let userId: String
        pub let skill: String
        pub let verifiedAt: UFix64
        pub let transactionId: String
        pub let blockHeight: UInt64

        init(userId: String, skill: String, transactionId: String) {
            self.userId = userId
            self.skill = skill
            self.verifiedAt = getCurrentBlock().timestamp
            self.transactionId = transactionId
            self.blockHeight = getCurrentBlock().height
        }
    }

    // Learning Certificate NFT
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let skill: String
        pub let userId: String
        pub let issuedAt: UFix64
        pub let verificationRecord: SkillRecord

        init(id: UInt64, skill: String, userId: String, verificationRecord: SkillRecord) {
            self.id = id
            self.skill = skill
            self.userId = userId
            self.issuedAt = getCurrentBlock().timestamp
            self.verificationRecord = verificationRecord
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>(),
                Type<MetadataViews.Traits>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: "SuperLearn ".concat(self.skill).concat(" Certificate"),
                        description: "Certificate proving mastery of ".concat(self.skill).concat(" crypto skills through SuperLearn platform"),
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://superlearn.app/certificates/".concat(self.skill.toLower()).concat(".png")
                        )
                    )
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(
                        self.id
                    )
                case Type<MetadataViews.Traits>():
                    return MetadataViews.Traits([
                        MetadataViews.Trait(
                            name: "skill",
                            value: self.skill,
                            displayType: nil,
                            rarity: nil
                        ),
                        MetadataViews.Trait(
                            name: "verification_block",
                            value: self.verificationRecord.blockHeight,
                            displayType: "Number",
                            rarity: nil
                        ),
                        MetadataViews.Trait(
                            name: "learner_id",
                            value: self.userId,
                            displayType: nil,
                            rarity: nil
                        )
                    ])
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://superlearn.app/certificate/".concat(self.id.toString()))
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: SuperLearnActions.CollectionStoragePath,
                        publicPath: SuperLearnActions.CollectionPublicPath,
                        providerPath: /private/SuperLearnActionsCollection,
                        publicCollection: Type<&SuperLearnActions.Collection{SuperLearnActions.SuperLearnActionsCollectionPublic}>(),
                        publicLinkedType: Type<&SuperLearnActions.Collection{SuperLearnActions.SuperLearnActionsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&SuperLearnActions.Collection{SuperLearnActions.SuperLearnActionsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-SuperLearnActions.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://superlearn.app/logo.png"
                        ),
                        mediaType: "image/png"
                    )
                    return MetadataViews.NFTCollectionDisplay(
                        name: "SuperLearn Certificates",
                        description: "Blockchain-verified certificates proving crypto learning achievements",
                        externalURL: MetadataViews.ExternalURL("https://superlearn.app"),
                        squareImage: media,
                        bannerImage: media,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/superlearn")
                        }
                    )
            }
            return nil
        }
    }

    // Collection interface
    pub resource interface SuperLearnActionsCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowSuperLearnActions(id: UInt64): &SuperLearnActions.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow SuperLearnActions reference: the ID of the returned reference is incorrect"
            }
        }
    }

    // Collection Resource
    pub resource Collection: SuperLearnActionsCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @SuperLearnActions.NFT
            let id: UInt64 = token.id
            emit Deposit(id: id, to: self.owner?.address)
            self.ownedNFTs[id] <-! token
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowSuperLearnActions(id: UInt64): &SuperLearnActions.NFT? {
            if self.ownedNFTs[id] != nil {
                return (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)! as! &SuperLearnActions.NFT
            }
            return nil
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let superLearnActions = nft as! &SuperLearnActions.NFT
            return superLearnActions as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // Minter Resource for issuing certificates
    pub resource NFTMinter {
        
        // Verify a skill completion and issue certificate
        pub fun verifySkillAndIssueCertificate(
            recipient: Address,
            userId: String,
            skill: String,
            transactionId: String
        ): UInt64 {
            pre {
                skill.length > 0: "Skill name cannot be empty"
                userId.length > 0: "User ID cannot be empty"
                transactionId.length > 0: "Transaction ID cannot be empty"
            }

            // Create skill verification record
            let skillRecord = SkillRecord(
                userId: userId,
                skill: skill,
                transactionId: transactionId
            )

            // Store the verification
            let verificationKey = userId.concat("_").concat(skill)
            SuperLearnActions.skillVerifications[verificationKey] = skillRecord

            // Mint certificate NFT
            let newNFT <- create NFT(
                id: SuperLearnActions.totalSupply,
                skill: skill,
                userId: userId,
                verificationRecord: skillRecord
            )

            let certificateId = newNFT.id
            SuperLearnActions.totalSupply = SuperLearnActions.totalSupply + UInt64(1)

            // Get recipient's collection
            let recipientCollection = getAccount(recipient)
                .getCapability(SuperLearnActions.CollectionPublicPath)
                .borrow<&{NonFungibleToken.CollectionPublic}>()
                ?? panic("Could not get receiver reference to the NFT Collection")

            // Deposit the NFT
            recipientCollection.deposit(token: <-newNFT)

            // Track user certificates
            if SuperLearnActions.userCertificates[recipient] == nil {
                SuperLearnActions.userCertificates[recipient] = []
            }
            SuperLearnActions.userCertificates[recipient]!.append(certificateId)

            emit SkillVerified(userId: userId, skill: skill, transactionId: transactionId)
            emit CertificateIssued(certificateId: certificateId, recipient: recipient, skill: skill)

            return certificateId
        }

        // Batch verification for multiple skills
        pub fun verifyMultipleSkills(
            recipient: Address,
            userId: String,
            skillsAndTransactions: {String: String}
        ): [UInt64] {
            let certificateIds: [UInt64] = []
            
            for skill in skillsAndTransactions.keys {
                let transactionId = skillsAndTransactions[skill]!
                let certificateId = self.verifySkillAndIssueCertificate(
                    recipient: recipient,
                    userId: userId,
                    skill: skill,
                    transactionId: transactionId
                )
                certificateIds.append(certificateId)
            }
            
            return certificateIds
        }
    }

    // Public functions for querying
    pub fun getSkillVerification(userId: String, skill: String): SkillRecord? {
        let verificationKey = userId.concat("_").concat(skill)
        return SuperLearnActions.skillVerifications[verificationKey]
    }

    pub fun getUserCertificates(user: Address): [UInt64] {
        return SuperLearnActions.userCertificates[user] ?? []
    }

    pub fun isSkillVerified(userId: String, skill: String): Bool {
        return self.getSkillVerification(userId: userId, skill: skill) != nil
    }

    pub fun getTotalSupply(): UInt64 {
        return SuperLearnActions.totalSupply
    }

    // Create empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    init() {
        self.CollectionStoragePath = /storage/SuperLearnActionsCollection
        self.CollectionPublicPath = /public/SuperLearnActionsCollection
        self.MinterStoragePath = /storage/SuperLearnActionsMinter

        self.totalSupply = 0
        self.skillVerifications = {}
        self.userCertificates = {}

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}