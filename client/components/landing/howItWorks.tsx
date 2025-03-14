import React from 'react';
import { 
  ShieldCheck, 
  Gavel, 
  Banknote, 
  Layers, 
  TrendingUp, 
  CheckSquare 
} from 'lucide-react';

const InvestmentFeaturesGrid = () => {
  const investmentFeatures = [
    {
      title: "Tokenized Equity Ownership",
      desc: "Convert startup equity into NFTs for secure, transparent, and legally binding ownership.",
      icon: "ShieldCheck"
    },
    {
      title: "Governance & Voting Rights",
      desc: "Own ERC-721 NFTs to gain governance or valuation rights and influence key decisions.",
      icon: "Gavel"
    },
    {
      title: "Seamless Profit Distribution",
      desc: "Exit by selling NFTs or earning a share of the startup's profits.",
      icon: "Banknote"
    },
    {
      title: "Fractional Investment via NFTs",
      desc: "Invest fractionally with ERC-1155 NFTs, ensuring stable and compliant ownership.",
      icon: "Layers"
    },
    {
      title: "Dynamic Startup Valuation",
      desc: "NFT-based equity adapts to real-time market conditions without rigid tokenomics.",
      icon: "TrendingUp"
    },
    {
      title: "Verified & Secure Investments",
      desc: "Only validated startups get tokenized, ensuring trust and investor protection.",
      icon: "CheckSquare" // Changed from CheckShield as it's not available in lucide-react
    }
  ];

  const getIcon = (iconName: any) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-10 h-10 text-indigo-500" />;
      case 'Gavel':
        return <Gavel className="w-10 h-10 text-indigo-500" />;
      case 'Banknote':
        return <Banknote className="w-10 h-10 text-indigo-500" />;
      case 'Layers':
        return <Layers className="w-10 h-10 text-indigo-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-10 h-10 text-indigo-500" />;
      case 'CheckSquare':
        return <CheckSquare className="w-10 h-10 text-indigo-500" />;
      default:
        return <ShieldCheck className="w-10 h-10 text-indigo-500" />;
    }
  };

  return (
    <section className="pb-16 px-4 relative overflow-hidden">
      {/* Fancy Background Effects */}

      
      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investmentFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-indigo-500/8 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group"
            >
              <div className="bg-indigo-900/30 rounded-full p-3 inline-block mb-4 group-hover:bg-indigo-900/50 transition-all duration-300">
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-indigo-100">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentFeaturesGrid;