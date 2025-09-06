const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting dual deployment...');
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');
  
  // Deploy ERC1155 Contract (existing)
  console.log('📋 Deploying CarbonCreditToken (ERC1155)...');
  const CarbonCreditToken = await ethers.getContractFactory('CarbonCreditToken');
  const carbonToken = await CarbonCreditToken.deploy();
  await carbonToken.waitForDeployment();
  const erc1155Address = await carbonToken.getAddress();
  console.log('✅ ERC1155 Contract deployed to:', erc1155Address);
  
  // Deploy ERC20 Contract (new)
  console.log('🪙 Deploying CarbonXToken (ERC20)...');
  const CarbonXToken = await ethers.getContractFactory('CarbonXToken');
  const carbonXToken = await CarbonXToken.deploy();
  await carbonXToken.waitForDeployment();
  const erc20Address = await carbonXToken.getAddress();
  console.log('✅ ERC20 Contract deployed to:', erc20Address);
  
  // Setup ERC1155 contract
  console.log('🔧 Setting up ERC1155 contract...');
  await carbonToken.authorizeIssuer(deployer.address);
  
  // Create sample projects for ERC1155
  await carbonToken.createProject(
    'Amazon Rainforest Conservation Project',
    'VCS',
    1000,
    ethers.parseEther('0.01'),
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
    'Brazil',
    'Forest Conservation',
    'ipfs://QmExampleHash1'
  );
  
  await carbonToken.createProject(
    'Solar Energy Farm Initiative',
    'Gold Standard',
    500,
    ethers.parseEther('0.008'),
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
    'California, USA',
    'Renewable Energy',
    'ipfs://QmExampleHash2'
  );
  
  console.log('✅ ERC1155 sample projects created!');
  
  // Setup ERC20 contract
  console.log('🔧 Setting up ERC20 contract...');
  
  // Add sample projects to ERC20
  const project1Tx = await carbonXToken.addProject(
    'Wind Farm Carbon Reduction',
    'CDM',
    'Texas, USA',
    ethers.parseEther('2000') // 2000 tonnes
  );
  await project1Tx.wait();
  
  const project2Tx = await carbonXToken.addProject(
    'Reforestation Initiative',
    'VCS',
    'Indonesia',
    ethers.parseEther('1500') // 1500 tonnes
  );
  await project2Tx.wait();
  
  // Mint some initial ERC20 tokens
  await carbonXToken.mintFromProject(
    deployer.address,
    ethers.parseEther('100'), // 100 CXB tokens
    0 // Wind farm project
  );
  
  await carbonXToken.mintFromProject(
    deployer.address,
    ethers.parseEther('75'), // 75 CXB tokens
    1 // Reforestation project
  );
  
  console.log('✅ ERC20 sample projects and tokens created!');
  
  // Display deployment summary
  console.log('\n🎉 Deployment Summary:');
  console.log('═══════════════════════════════════════');
  console.log('📊 ERC1155 Contract (Multi-Token):');
  console.log('   Address:', erc1155Address);
  console.log('   Features: Unique project tokens, marketplace');
  console.log('   Projects: 2 sample projects created');
  console.log('');
  console.log('🪙 ERC20 Contract (Fungible Token):');
  console.log('   Address:', erc20Address);
  console.log('   Symbol: CXB (CarbonX Token)');
  console.log('   Total Supply: 175 CXB');
  console.log('   Projects: 2 sample projects created');
  console.log('');
  console.log('🔧 Environment Setup:');
  console.log('   Update .env.local with:');
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${erc1155Address}`);
  console.log(`   NEXT_PUBLIC_ERC20_ADDRESS=${erc20Address}`);
  console.log('');
  console.log('🌐 Network: Hardhat Local (Chain ID: 31337)');
  console.log('🔗 RPC URL: http://127.0.0.1:8545');
  console.log('');
  console.log('📈 Next Steps:');
  console.log('   • Connect MetaMask to local network');
  console.log('   • Import deployer account to MetaMask');
  console.log('   • Test marketplace functionality');
  console.log('   • Set up Uniswap integration for ERC20');
}

main()
  .then(() => {
    console.log('🎉 Dual deployment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
