const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking project details and issuer status...");
    
    const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
    const contract = CarbonCreditToken.attach(contractAddress);
    
    try {
        // Get current token ID (number of projects)
        const currentTokenId = await contract.getCurrentTokenId();
        console.log("📊 Total projects created:", currentTokenId.toString());
        
        // Check details for all projects
        for (let i = 1; i <= currentTokenId; i++) {
            const project = await contract.projects(i);
            console.log(`\n🌳 Project ${i} Details:`);
            console.log("- Name:", project.name);
            console.log("- CO2 Tonnes:", project.co2Tonnes.toString());
            console.log("- Price per Tonne:", ethers.formatEther(project.pricePerTonne), "ETH");
            console.log("- Project Issuer:", project.issuer);
            console.log("- Location:", project.location);
            console.log("- Type:", project.projectType);
            console.log("- Is Active:", project.isActive);
            
            // Check if the MetaMask account is the issuer
            const metamaskAccount = "0x921157C12B66EaF21DA82F3e289eCDB6EF069Ea5";
            const isProjectIssuer = project.issuer.toLowerCase() === metamaskAccount.toLowerCase();
            console.log("- You are the issuer:", isProjectIssuer ? "✅ YES" : "❌ NO");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
