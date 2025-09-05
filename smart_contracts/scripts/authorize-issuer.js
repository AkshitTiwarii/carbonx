const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🔐 Authorizing MetaMask account as issuer...");
    
    // Get the deployed contract address
    const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    
    // Get the deployer account (should be the owner)
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using deployer account:", deployer.address);
    
    // Connect to the contract
    const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
    const contract = CarbonCreditToken.attach(contractAddress);
    
    // The MetaMask account that needs to be authorized
    const metamaskAccount = "0x921157C12B66EaF21DA82F3e289eCDB6EF069Ea5";
    
    try {
        // Check if already authorized
        const isAuthorized = await contract.authorizedIssuers(metamaskAccount);
        
        if (isAuthorized) {
            console.log("✅ Account is already authorized as an issuer!");
        } else {
            console.log("➡️ Authorizing account as issuer...");
            
            // Authorize the MetaMask account as an issuer
            const tx = await contract.authorizeIssuer(metamaskAccount);
            console.log("⏳ Transaction sent:", tx.hash);
            
            // Wait for confirmation
            await tx.wait();
            console.log("✅ Successfully authorized as issuer!");
        }
        
        // Verify authorization
        const finalCheck = await contract.authorizedIssuers(metamaskAccount);
        console.log("🔍 Final authorization status:", finalCheck);
        
    } catch (error) {
        console.error("❌ Error authorizing issuer:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
