'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Leaf, 
  ShoppingCart, 
  Star, 
  ExternalLink, 
  Recycle, 
  Trophy,
  CheckCircle,
  Info,
  TrendingUp,
  Globe,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toucanService, ToucanProject, ToucanRetirement } from '@/lib/toucan-integration';
import { JsonRpcProvider, BrowserProvider, parseEther } from 'ethers';

interface MarketplaceListing {
  id: string;
  project: ToucanProject;
  seller: string;
  amount: string;
  pricePerCredit: string;
  totalPrice: string;
  listedAt: number;
}

export default function ToucanIntegratedMarketplace() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [projects, setProjects] = useState<ToucanProject[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [retirements, setRetirements] = useState<ToucanRetirement[]>([]);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ToucanProject | null>(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [retireAmount, setRetireAmount] = useState('');
  const [retireMessage, setRetireMessage] = useState('');
  const [toucanInitialized, setToucanInitialized] = useState(false);

  // Initialize Toucan SDK when component mounts
  useEffect(() => {
    initializeToucan();
    loadProjects();
    loadRetirements();
  }, []);

  const initializeToucan = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const initialized = await toucanService.initialize(provider as any, signer);
        setToucanInitialized(initialized);
        
        if (initialized) {
          const address = await signer.getAddress();
          setUserAddress(address);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Toucan:', error);
    }
  };

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const availableProjects = await toucanService.getAvailableProjects();
      setProjects(availableProjects);
      
      // Generate mock listings from projects
      const mockListings: MarketplaceListing[] = availableProjects.slice(0, 3).map((project, index) => ({
        id: `listing-${index}`,
        project,
        seller: '0x1234...5678',
        amount: (Math.random() * 100 + 10).toFixed(1),
        pricePerCredit: project.pricePerToken,
        totalPrice: ((Math.random() * 100 + 10) * parseFloat(project.pricePerToken)).toFixed(2),
        listedAt: Date.now() - Math.random() * 86400000
      }));
      
      setListings(mockListings);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRetirements = async () => {
    if (userAddress) {
      const history = await toucanService.getRetirementHistory(userAddress);
      setRetirements(history);
    }
  };

  const handleBuyCredits = async (listing: MarketplaceListing) => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would interact with your marketplace contract
      // and then use Toucan to redeem the purchased pool tokens to specific TCO2
      
      const redeemHash = await toucanService.redeemToTCO2(buyAmount, 'NCT');
      
      if (redeemHash) {
        alert(`✅ Successfully purchased and redeemed ${buyAmount} carbon credits!\\nTransaction: ${redeemHash}`);
        setBuyAmount('');
      } else {
        alert('❌ Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('❌ Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetireCredits = async () => {
    if (!selectedProject || !retireAmount || parseFloat(retireAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      const retirement = await toucanService.retireCredits(
        retireAmount,
        selectedProject.id, // In real implementation, this would be the TCO2 token address
        userAddress || 'Anonymous',
        retireMessage || 'Carbon footprint offset via CarbonX'
      );
      
      if (retirement) {
        setRetirements(prev => [retirement, ...prev]);
        alert(`🔥 Successfully retired ${retireAmount} carbon credits!\\nCertificate: ${retirement.certificate}`);
        setRetireAmount('');
        setRetireMessage('');
        setSelectedProject(null);
      } else {
        alert('❌ Retirement failed. Please try again.');
      }
    } catch (error) {
      console.error('Retirement failed:', error);
      alert('❌ Retirement failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOffsetCarbon = async (amount: string) => {
    setIsLoading(true);
    try {
      const offsetHash = await toucanService.offsetCarbon(
        amount,
        'USDC',
        'One-click carbon offset via CarbonX'
      );
      
      if (offsetHash) {
        alert(`🌱 Successfully offset ${amount} USD worth of carbon!\\nTransaction: ${offsetHash}`);
      } else {
        alert('❌ Offset failed. Please try again.');
      }
    } catch (error) {
      console.error('Offset failed:', error);
      alert('❌ Offset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStandardBadgeColor = (standard: string) => {
    switch (standard.toLowerCase()) {
      case 'vcs': return 'bg-green-100 text-green-800';
      case 'cdm': return 'bg-blue-100 text-blue-800';
      case 'gold standard': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-zinc-800 text-zinc-100';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">
            🌱 CarbonX × Toucan Protocol
          </h1>
          <p className="text-xl text-zinc-400 mb-4">
            Real carbon credits powered by blockchain technology
          </p>
          
          {/* Toucan Status */}
          <Alert className={`max-w-2xl mx-auto mb-6 ${toucanInitialized ? 'border-emerald-800 bg-emerald-900/20 text-emerald-100' : 'border-yellow-800 bg-yellow-900/20 text-yellow-100'}`}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {toucanInitialized ? (
                <span className="text-green-700">
                  ✅ Connected to Toucan Protocol - Access to real Verra-verified carbon credits
                </span>
              ) : (
                <span className="text-yellow-700">
                  🔄 Initializing Toucan Protocol integration... Connect your wallet to access real credits
                </span>
              )}
            </AlertDescription>
          </Alert>
          
          {/* Integration Notice */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Toucan Protocol Integration</span>
            </div>
            <p className="text-blue-700">
              <strong>We plan to integrate Toucan's APIs in the future to fetch certified credits directly.</strong>
              {' '}This marketplace demonstrates real blockchain-based carbon credit functionality using Toucan's SDK 
              for minting, trading, and retiring verified carbon credits from projects like Rimba Raya and Kichwa Indigenous Territory.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="retire" className="flex items-center gap-2">
              <Recycle className="h-4 w-4" />
              Retire Credits
            </TabsTrigger>
            <TabsTrigger value="offset" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Quick Offset
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{listing.project.name}</CardTitle>
                      {listing.project.verraId && (
                        <Badge className="bg-emerald-900/50 text-emerald-100 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Toucan Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getStandardBadgeColor(listing.project.standard)}>
                        {listing.project.standard}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {listing.project.vintage}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {listing.project.region}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-zinc-300 text-sm mb-4 line-clamp-3">
                      {listing.project.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">Available:</span>
                        <span className="font-medium">{listing.amount} credits</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">Price per credit:</span>
                        <span className="font-medium">${listing.pricePerCredit}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Value:</span>
                        <span>${listing.totalPrice}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleBuyCredits(listing)}
                        disabled={isLoading || !buyAmount}
                        className="bg-emerald-700 hover:bg-emerald-600"
                      >
                        Buy Credits
                      </Button>
                    </div>
                    
                    {listing.project.verraId && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-zinc-400">
                          Verra ID: {listing.project.verraId}
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Verra
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Carbon Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg">
                      <span className="font-medium text-zinc-100">Total Credits Owned</span>
                      <span className="text-2xl font-bold text-emerald-100">47.5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-900/30 border border-blue-800 rounded-lg">
                      <span className="font-medium text-zinc-100">Total Credits Retired</span>
                      <span className="text-2xl font-bold text-blue-100">25.0</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-900/30 border border-purple-800 rounded-lg">
                      <span className="font-medium text-zinc-100">Portfolio Value</span>
                      <span className="text-2xl font-bold text-purple-100">$592.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Recent Retirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {retirements.slice(0, 3).map((retirement) => (
                      <div key={retirement.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{retirement.amount} credits</span>
                          <span className="text-xs text-zinc-400">
                            {new Date(retirement.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 mb-2">{retirement.retirementMessage}</p>
                        {retirement.certificate && (
                          <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Retire Credits Tab */}
          <TabsContent value="retire">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Recycle className="h-5 w-5" />
                    Retire Carbon Credits
                  </CardTitle>
                  <p className="text-zinc-300">
                    Permanently remove carbon credits from circulation to offset your carbon footprint
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="project-select">Select Project</Label>
                    <select
                      id="project-select"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={selectedProject?.id || ''}
                      onChange={(e) => {
                        const project = projects.find(p => p.id === e.target.value);
                        setSelectedProject(project || null);
                      }}
                    >
                      <option value="">Choose a carbon credit project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.standard} - {project.vintage})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="retire-amount">Amount to Retire</Label>
                    <Input
                      id="retire-amount"
                      type="number"
                      placeholder="Enter amount..."
                      value={retireAmount}
                      onChange={(e) => setRetireAmount(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="retire-message">Retirement Message (Optional)</Label>
                    <Textarea
                      id="retire-message"
                      placeholder="e.g., Offsetting my monthly carbon footprint..."
                      value={retireMessage}
                      onChange={(e) => setRetireMessage(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleRetireCredits}
                    disabled={isLoading || !selectedProject || !retireAmount}
                    className="w-full bg-red-700 hover:bg-red-600"
                  >
                    {isLoading ? 'Processing...' : 'Retire Credits'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quick Offset Tab */}
          <TabsContent value="offset">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    One-Click Carbon Offset
                  </CardTitle>
                  <p className="text-zinc-300">
                    Instantly offset your carbon footprint using Toucan's OffsetHelper
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {['10', '25', '50', '100'].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => handleOffsetCarbon(amount)}
                        disabled={isLoading}
                        className="h-20 flex flex-col items-center justify-center hover:bg-zinc-800 border border-zinc-700"
                      >
                        <DollarSign className="h-6 w-6 mb-1" />
                        <span className="font-bold">${amount}</span>
                        <span className="text-xs text-zinc-400">~{(parseFloat(amount) / 10).toFixed(1)} tCO₂</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-zinc-300 mb-4">
                      This feature uses Toucan's OffsetHelper to automatically:
                    </p>
                    <ol className="text-sm text-zinc-300 text-left space-y-1 mb-6">
                      <li>1. Swap your tokens for pool tokens (NCT/BCT)</li>
                      <li>2. Redeem pool tokens for specific TCO₂ tokens</li>
                      <li>3. Retire the TCO₂ tokens permanently</li>
                    </ol>
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Connect your wallet and ensure you have USDC on Polygon network to use this feature.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
