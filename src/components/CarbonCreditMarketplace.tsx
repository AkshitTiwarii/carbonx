"use client";

import { useState, useEffect } from 'react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { carbonCreditContract, ContractProject, ContractListing } from '@/lib/carbonContract';
import { 
  Coins, 
  ShoppingCart, 
  Plus, 
  Clock, 
  MapPin, 
  Leaf, 
  TrendingUp, 
  Users,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader
} from 'lucide-react';

interface CarbonProject {
  tokenId: string;
  name: string;
  methodology: string;
  co2Tonnes: string;
  pricePerTonne: string;
  expiryDate: string;
  location: string;
  projectType: string;
  issuer: string;
  isActive: boolean;
  metadataURI: string;
}

interface Listing {
  listingId: string;
  tokenId: string;
  amount: string;
  pricePerToken: string;
  seller: string;
  isActive: boolean;
  listedAt: string;
}

export default function CarbonCreditMarketplace() {
  const account = useActiveAccount();
  
  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [userBalance, setUserBalance] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'mint' | 'portfolio'>('marketplace');
  const [contractInitialized, setContractInitialized] = useState(false);
  
  // Mint form state
  const [mintForm, setMintForm] = useState({
    name: '',
    methodology: 'VCS',
    co2Tonnes: '',
    pricePerTonne: '',
    expiryDate: '',
    location: '',
    projectType: 'Forest Conservation',
    metadataURI: ''
  });

  useEffect(() => {
    if (account) {
      initializeContract();
    } else {
      // Show empty state when not connected
      setProjects([]);
      setListings([]);
      setUserBalance({});
      setContractInitialized(false);
      setLoading(false);
    }
  }, [account]);

  const initializeContract = async () => {
    setLoading(true);
    try {
      console.log('🔄 Initializing contract...');
      console.log('Window ethereum available:', !!window.ethereum);
      console.log('Account connected:', !!account);
      
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        // Check if we're on the right network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current chain ID:', chainId);
        
        if (chainId !== '0x7a69') { // 0x7a69 = 31337 in hex
          console.warn('Wrong network! Expected 31337, got:', parseInt(chainId, 16));
          alert('Please switch to Hardhat Local network (Chain ID: 31337) in MetaMask');
          setContractInitialized(false);
          setLoading(false);
          return;
        }
        
        await carbonCreditContract.initialize(window.ethereum);
        setContractInitialized(true);
        console.log('✅ Contract initialized successfully');
        
        console.log('📊 Loading contract data...');
        await loadContractData();
        console.log('✅ Contract data loaded successfully');
      } else {
        throw new Error('MetaMask not detected');
      }
    } catch (error) {
      console.error('❌ Failed to initialize contract:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setContractInitialized(false);
      setProjects([]);
      setListings([]);
      setUserBalance({});
      setLoading(false);
      
      alert(`Contract initialization failed: ${errorMessage}\n\nPlease ensure:\n1. Hardhat node is running\n2. Contract is deployed\n3. You are on the correct network (Chain ID: 31337)`);
    }
  };

  const loadContractData = async () => {
    try {
      console.log('🔄 Starting loadContractData...');
      
      // Load projects from smart contract
      console.log('📝 Calling carbonCreditContract.getProjects()...');
      const contractProjects = await carbonCreditContract.getProjects();
      console.log('✅ Projects loaded successfully:', contractProjects.length, 'projects');
      console.log('📋 Project details:', contractProjects);
      setProjects(contractProjects);
      
      // Load listings from smart contract
      console.log('🛒 Calling carbonCreditContract.getListings()...');
      const contractListings = await carbonCreditContract.getListings();
      console.log('✅ Listings loaded successfully:', contractListings.length, 'listings');
      console.log('📋 Listing details:', contractListings);
      setListings(contractListings);
      
      // Load user balances for each project (don't fail entire loading if this fails)
      const balances: {[key: string]: string} = {};
      if (account) {
        console.log('💰 Loading user balances for account:', account.address);
        for (const project of contractProjects) {
          try {
            console.log(`Checking balance for token ${project.tokenId}...`);
            const balance = await carbonCreditContract.getUserBalance(account.address, project.tokenId);
            balances[project.tokenId] = balance;
            console.log(`✅ Token ${project.tokenId} balance: ${balance}`);
          } catch (error) {
            console.error(`❌ Error loading balance for token ${project.tokenId}:`, error);
            balances[project.tokenId] = "0";
          }
        }
        console.log('💰 Final balances:', balances);
      } else {
        console.log('⚠️ No account connected, skipping balance loading');
      }
      setUserBalance(balances);
      
      console.log('🎉 loadContractData completed successfully!');
      
    } catch (error) {
      console.error("❌ MAJOR ERROR in loadContractData:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      // No fallback - just show error and empty data
      setProjects([]);
      setListings([]);
      setUserBalance({});
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to load contract data: ${errorMessage}\n\nPlease ensure the contract is properly deployed and accessible.`);
    }
    
    setLoading(false);
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const formatEther = (wei: string) => {
    return parseFloat(wei).toFixed(4);
  };

  const handleMintProject = async () => {
    if (!account || !contractInitialized) {
      alert("Please connect your wallet and ensure the contract is initialized.");
      return;
    }
    
    try {
      console.log("Creating project on blockchain:", mintForm);
      
      // Call the smart contract to create the project
      const tx = await carbonCreditContract.createProject({
        name: mintForm.name,
        methodology: mintForm.methodology,
        co2Tonnes: mintForm.co2Tonnes,
        pricePerTonne: mintForm.pricePerTonne,
        expiryDate: mintForm.expiryDate,
        location: mintForm.location,
        projectType: mintForm.projectType,
        metadataURI: mintForm.metadataURI
      });
      
      console.log("Transaction successful:", tx);
      
      // Reload contract data to show the new project
      await loadContractData();
      
      // Reset form
      setMintForm({
        name: '',
        methodology: 'VCS',
        co2Tonnes: '',
        pricePerTonne: '',
        expiryDate: '',
        location: '',
        projectType: 'Forest Conservation',
        metadataURI: ''
      });
      
      alert("Project created successfully on the blockchain! 🎉");
      
    } catch (error) {
      console.error("Error creating project:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error creating project: ${errorMessage}`);
    }
  };

  const handleMintCredits = async (tokenId: string, amount: string, pricePerTonne: string) => {
    if (!account || !contractInitialized) {
      alert("Please connect your wallet first.");
      return;
    }
    
    try {
      console.log(`Minting ${amount} credits for token ${tokenId}`);
      
      const tx = await carbonCreditContract.mintCredits(tokenId, amount, pricePerTonne);
      console.log("Mint transaction successful:", tx);
      
      // Reload contract data to show updated balances
      await loadContractData();
      
      alert(`Successfully minted ${amount} carbon credits! 🌱`);
      
    } catch (error) {
      console.error("Error minting credits:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error minting credits: ${errorMessage}`);
    }
  };

  const handleBuyCredits = async (listingId: string, amount: string, pricePerToken: string) => {
    if (!account || !contractInitialized) {
      alert("Please connect your wallet first.");
      return;
    }
    
    try {
      console.log(`Buying ${amount} credits from listing ${listingId}`);
      
      const tx = await carbonCreditContract.buyCredits(listingId, amount, pricePerToken);
      console.log("Purchase transaction successful:", tx);
      
      // Reload contract data to show updated balances and listings
      await loadContractData();
      
      alert(`Successfully purchased ${amount} carbon credits! 🎉`);
      
    } catch (error) {
      console.error("Error buying credits:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error buying credits: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center justify-center gap-3">
            <Coins className="w-10 h-10 text-green-500" />
            Carbon Credit Marketplace
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Trade verified carbon credits on blockchain. Each token represents 1 ton of CO₂ offset.
          </p>
        </div>

        {/* Wallet Connection */}
        {!account ? (
          <div className="flex justify-center mb-8">
            <ConnectButton
              client={require('@/app/client').client}
              appMetadata={{
                name: "CarbonX Marketplace",
                url: "https://carbonx.local",
              }}
            />
          </div>
        ) : (
          <div className="flex justify-center mb-8">
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </span>
            </div>
          </div>
        )}

        {/* Contract Status */}
        <div className={`border rounded-lg p-4 mb-8 ${
          contractInitialized 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {contractInitialized ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Loader className="w-5 h-5 text-yellow-600 animate-spin" />
            )}
            <span className={`font-medium ${
              contractInitialized 
                ? 'text-green-700 dark:text-green-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {contractInitialized ? 'Contract Ready' : 'Contract Initializing...'}
            </span>
          </div>
          <p className={`text-sm mb-2 ${
            contractInitialized 
              ? 'text-green-600 dark:text-green-400'
              : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            Smart contract is deployed at: <code className={`px-2 py-1 rounded text-xs ${
              contractInitialized 
                ? 'bg-green-100 dark:bg-green-800'
                : 'bg-yellow-100 dark:bg-yellow-800'
            }`}>{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</code>
          </p>
          <p className={`text-sm ${
            contractInitialized 
              ? 'text-green-600 dark:text-green-400'
              : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {contractInitialized 
              ? 'You can now mint and trade carbon credits using real blockchain transactions!'
              : 'Please ensure your wallet is connected to the local network (Chain ID: 31337).'
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1 flex">
            {[
              { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
              { id: 'mint', label: 'Create Project', icon: Plus },
              { id: 'portfolio', label: 'Portfolio', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Marketplace Tab */}
            {activeTab === 'marketplace' && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Available Carbon Credits</h2>
                {listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => {
                      const project = projects.find(p => p.tokenId === listing.tokenId);
                      if (!project) return null;
                      
                      return (
                        <div key={listing.listingId} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{project.name}</h3>
                              <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                                {project.methodology}
                              </span>
                            </div>
                            <Leaf className="w-6 h-6 text-green-500" />
                          </div>
                          
                          <div className="space-y-2 mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {project.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Expires: {formatDate(project.expiryDate)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {listing.amount} credits available
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                              {formatEther(listing.pricePerToken)} ETH
                            </span>
                            <span className="text-sm text-zinc-500">per credit</span>
                          </div>
                          
                          {account && (
                            <button
                              onClick={() => {
                                if (contractInitialized) {
                                  const amount = prompt(`How many credits do you want to buy? (Available: ${listing.amount})`);
                                  if (amount && parseInt(amount) > 0 && parseInt(amount) <= parseInt(listing.amount)) {
                                    handleBuyCredits(listing.listingId, amount, listing.pricePerToken);
                                  }
                                } else {
                                  alert("Contract not initialized. Please refresh and try again.");
                                }
                              }}
                              disabled={!contractInitialized}
                              className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                                contractInitialized
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              {contractInitialized ? 'Buy Credits' : 'Contract Loading...'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400">No carbon credits listed for sale</p>
                  </div>
                )}
              </div>
            )}

            {/* Create Project Tab */}
            {activeTab === 'mint' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Create Carbon Credit Project</h2>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={mintForm.name}
                        onChange={(e) => setMintForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        placeholder="Amazon Rainforest Conservation"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Methodology
                        </label>
                        <select
                          value={mintForm.methodology}
                          onChange={(e) => setMintForm(prev => ({ ...prev, methodology: e.target.value }))}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="VCS">VCS</option>
                          <option value="Gold Standard">Gold Standard</option>
                          <option value="CDM">CDM</option>
                          <option value="CAR">CAR</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Project Type
                        </label>
                        <select
                          value={mintForm.projectType}
                          onChange={(e) => setMintForm(prev => ({ ...prev, projectType: e.target.value }))}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="Forest Conservation">Forest Conservation</option>
                          <option value="Renewable Energy">Renewable Energy</option>
                          <option value="Methane Capture">Methane Capture</option>
                          <option value="Direct Air Capture">Direct Air Capture</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          CO₂ Tonnes
                        </label>
                        <input
                          type="number"
                          value={mintForm.co2Tonnes}
                          onChange={(e) => setMintForm(prev => ({ ...prev, co2Tonnes: e.target.value }))}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          placeholder="1000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Price per Tonne (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={mintForm.pricePerTonne}
                          onChange={(e) => setMintForm(prev => ({ ...prev, pricePerTonne: e.target.value }))}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          placeholder="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={mintForm.location}
                          onChange={(e) => setMintForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          placeholder="Brazil, Amazon"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={mintForm.expiryDate}
                          onChange={(e) => setMintForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                    
                    {account && (
                      <button
                        onClick={handleMintProject}
                        disabled={!contractInitialized || !mintForm.name || !mintForm.co2Tonnes || !mintForm.pricePerTonne || !mintForm.expiryDate}
                        className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                          contractInitialized && mintForm.name && mintForm.co2Tonnes && mintForm.pricePerTonne && mintForm.expiryDate
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {contractInitialized ? 'Create Project on Blockchain' : 'Contract Loading...'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Your Carbon Credit Portfolio</h2>
                {account ? (
                  <div className="space-y-8">
                    {/* Owned Credits */}
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Owned Credits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                          const balance = userBalance[project.tokenId] || "0";
                          if (balance === "0") return null;
                          
                          return (
                            <div key={project.tokenId} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{project.name}</h3>
                                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                                    {project.methodology}
                                  </span>
                                </div>
                                <Leaf className="w-6 h-6 text-green-500" />
                              </div>
                              
                              <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-green-600 mb-1">{balance}</div>
                                <div className="text-sm text-zinc-500">Credits Owned</div>
                              </div>
                              
                              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <div className="flex justify-between">
                                  <span>Project Type:</span>
                                  <span>{project.projectType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Location:</span>
                                  <span>{project.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Expires:</span>
                                  <span>{formatDate(project.expiryDate)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {projects.every(project => (userBalance[project.tokenId] || "0") === "0") && (
                        <div className="text-center py-8 text-zinc-500">
                          You don't own any carbon credits yet. Mint some from the projects below!
                        </div>
                      )}
                    </div>

                    {/* Available Projects to Mint */}
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Mint Carbon Credits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                          <div key={`mint-${project.tokenId}`} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{project.name}</h3>
                                <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                                  {project.methodology}
                                </span>
                              </div>
                              <Leaf className="w-6 h-6 text-green-500" />
                            </div>
                            
                            <div className="space-y-2 mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {project.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Expires: {formatDate(project.expiryDate)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {project.co2Tonnes} tonnes total
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {formatEther(project.pricePerTonne)} ETH
                              </span>
                              <span className="text-sm text-zinc-500">per tonne</span>
                            </div>
                            
                            <button
                              onClick={() => {
                                if (contractInitialized) {
                                  const amount = prompt(`How many carbon credits do you want to mint?`);
                                  if (amount && parseInt(amount) > 0) {
                                    handleMintCredits(project.tokenId, amount, project.pricePerTonne);
                                  }
                                } else {
                                  alert("Contract not initialized. Please refresh and try again.");
                                }
                              }}
                              disabled={!contractInitialized}
                              className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                                contractInitialized
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              {contractInitialized ? 'Mint Credits' : 'Contract Loading...'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400">Connect your wallet to view your portfolio</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
