const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Complete setup script starting...");
    
    try {
        // 1. Deploy the contract
        console.log("📋 Deploying CarbonCreditToken contract...");
        const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
        const carbonCreditToken = await CarbonCreditToken.deploy();
        await carbonCreditToken.waitForDeployment();
        
        const contractAddress = await carbonCreditToken.getAddress();
        console.log("✅ Contract deployed to:", contractAddress);
        
        // 2. Update .env.local file
        console.log("📝 Updating .env.local file...");
        const envPath = path.join(__dirname, '../../.env.local');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Update or add contract address
        const contractAddressRegex = /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/;
        const newContractLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`;
        
        if (contractAddressRegex.test(envContent)) {
            envContent = envContent.replace(contractAddressRegex, newContractLine);
        } else {
            envContent += `\n${newContractLine}\n`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log("✅ Environment file updated");
        
        // 3. Create sample project (Amazon)
        console.log("🌱 Creating Amazon Rainforest project...");
        const amazonTx = await carbonCreditToken.createProject(
            "Amazon Rainforest Conservation Project",
            "VCS",
            ethers.parseUnits("1000", 0),
            ethers.parseEther("0.01"),
            Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
            "Brazil, Amazon Basin",
            "Forest Conservation",
            "https://api.carbonx.com/metadata/sample-project.json"
        );
        await amazonTx.wait();
        console.log("✅ Amazon project created (ID: 1)");
        
        // 4. Authorize MetaMask account
        const metamaskAccount = "0x921157C12B66EaF21DA82F3e289eCDB6EF069Ea5";
        console.log("🔐 Authorizing MetaMask account as issuer...");
        const authTx = await carbonCreditToken.authorizeIssuer(metamaskAccount);
        await authTx.wait();
        console.log("✅ MetaMask account authorized");
        
        // 5. Create project for MetaMask account using impersonation
        console.log("🌞 Creating Solar Energy project for MetaMask account...");
        
        // Impersonate the MetaMask account
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [metamaskAccount],
        });
        
        await network.provider.send("hardhat_setBalance", [
            metamaskAccount,
            "0x56BC75E2D630E0000", // 100 ETH
        ]);
        
        const metamaskSigner = await ethers.getSigner(metamaskAccount);
        const contractWithMetaMask = carbonCreditToken.connect(metamaskSigner);
        
        const solarTx = await contractWithMetaMask.createProject(
            "Solar Energy Carbon Offset Project",
            "VCS",
            ethers.parseUnits("500", 0),
            ethers.parseEther("0.015"),
            Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
            "California, USA",
            "Solar Energy",
            "https://api.carbonx.com/metadata/solar-project.json"
        );
        await solarTx.wait();
        console.log("✅ Solar project created (ID: 2) - You own this one!");
        
        // 6. Verify everything
        console.log("\n🔍 Verification Summary:");
        const totalProjects = await carbonCreditToken.getCurrentTokenId();
        console.log(`📊 Total projects: ${totalProjects}`);
        
        for (let i = 1; i <= totalProjects; i++) {
            const project = await carbonCreditToken.projects(i);
            const isYourProject = project.issuer.toLowerCase() === metamaskAccount.toLowerCase();
            console.log(`🌟 Project ${i}: ${project.name} ${isYourProject ? '(YOURS!)' : ''}`);
        }
        
        const isAuthorized = await carbonCreditToken.authorizedIssuers(metamaskAccount);
        console.log(`🔑 Your account authorized: ${isAuthorized ? '✅ YES' : '❌ NO'}`);
        
        console.log("\n🎉 Setup complete! You can now:");
        console.log("1. Refresh your browser at http://localhost:3000/trading");
        console.log("2. You should see both projects");
        console.log("3. Mint credits from Project #2 (Solar Energy) - you own it!");
        
    } catch (error) {
        console.error("❌ Setup failed:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
