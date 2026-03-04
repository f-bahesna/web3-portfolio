import { useEffect, useState } from "react";
import { initWeb3 } from "./utils/web3";
import Web3 from "web3";
import { 
  Rocket, 
  PlusCircle, 
  ShieldCheck, 
  BarChart3, 
  Globe, 
  Wallet,
  Loader2,
  Info
} from "lucide-react";

const web3Instance = window.ethereum ? new Web3(window.ethereum) : null;

function App() {
  const [web3Data, setWeb3Data] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaings] = useState(true);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    desc: "",
    goal: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingFundCampaign, setLoadingFundCampaign] = useState("");

  const formatEther = (wei) => {
    if (!wei) return "0";
    if (web3Data.web3) return web3Data.web3.utils.fromWei(wei.toString(), "ether");
    if (web3Instance) return web3Instance.utils.fromWei(wei.toString(), "ether");
    return (parseFloat(wei) / 1e18).toString();
  };

  const toWei = (ether) => {
    if (!ether) return "0";
    if (web3Data.web3) return web3Data.web3.utils.toWei(ether.toString(), "ether");
    if (web3Instance) return web3Instance.utils.toWei(ether.toString(), "ether");
    return (parseFloat(ether) * 1e18).toString();
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await initWeb3();
        setWeb3Data(data || {});
        if (data && data.contract) {
          loadCampaigns(data.contract);
        } else {
          setLoadingCampaings(false);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setLoadingCampaings(false);
      }
    })();
  }, []);

  const loadCampaigns = async (contract) => {
    try {
      const campaigns = await contract.methods.getCampaigns().call();
      setCampaigns(campaigns);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoadingCampaings(false);
    }
  };

  const createCampaign = async (e) => {
    setLoading(true);
    e.preventDefault();
    const { contract, selectedAccount } = web3Data;

    if (!contract || !selectedAccount) {
      alert("Please connect your wallet first.");
      setLoading(false);
      return;
    }

    try {
      await contract.methods
        .createCampaign(newCampaign.title, newCampaign.desc, toWei(newCampaign.goal))
        .send({ from: selectedAccount });
      
      setNewCampaign({ title: "", desc: "", goal: "" });
      loadCampaigns(contract);
    } catch (error) {
      console.error("Smart contract revert:", error);
    } finally {
      setLoading(false);
    }
  };

  const fundCampaign = async (id, amount) => {
    setLoadingFundCampaign(id);
    const { contract, selectedAccount } = web3Data;
    if (!contract || !selectedAccount) {
      alert("Please connect your wallet first.");
      setLoadingFundCampaign(false);
      return;
    }

    try {
      await contract.methods.fund(id).send({
        from: selectedAccount,
        value: toWei(amount),
      });
      loadCampaigns(contract);
    } catch (error) {
      console.error("Funding error:", error);
    } finally {
      setLoadingFundCampaign(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-primary/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-brand-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-brand-primary" />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-brand-primary bg-clip-text text-transparent">
                SecureFund
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                <Wallet className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-mono">
                  {web3Data.selectedAccount ? `${web3Data.selectedAccount.slice(0, 6)}...${web3Data.selectedAccount.slice(-4)}` : "Connect Wallet"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium">
            <Globe className="w-4 h-4" />
            <span>Decentralized Crowdfunding Protocol</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
            The Future of <br />
            <span className="text-brand-primary">Community Funding</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A transparent, secure, and decentralized platform to bring your ideas to life. 
            No middleman, fully on-chain, and powered by smart contracts.
          </p>
          <div className="flex sm:flex-row flex-col justify-center gap-4 pt-4">
            <a href="#campaigns" className="px-8 py-4 bg-brand-primary text-brand-dark font-bold rounded-xl hover:bg-brand-accent transition-all transform hover:scale-105 active:scale-95 text-center">
              Explore Projects
            </a>
            <a href="#create" className="px-8 py-4 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-center">
              Start a Campaign
            </a>
          </div>
        </section>

        {/* Create Campaign Section */}
        <section id="create" className="scroll-mt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 lg:p-12">
            <div className="space-y-6">
              <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl w-fit">
                <Rocket className="w-6 h-6 text-brand-primary" />
              </div>
              <h2 className="text-3xl font-bold">Launch Your Vision</h2>
              <p className="text-slate-400">
                Setup your campaign in seconds. Define your goal, tell your story, 
                and let the world support your mission directly.
              </p>
              <ul className="space-y-3">
                {[
                  "100% On-chain Transparency",
                  "Direct Wallet-to-Wallet Funding",
                  "Smart Contract Validated Goals",
                  "Zero Platform Fees (Gas Only)"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <form onSubmit={createCampaign} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4 shadow-xl">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Campaign Title</label>
                <input
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                  placeholder="e.g. Save the Rainforest"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all h-24 resize-none"
                  placeholder="Tell us more about your mission..."
                  value={newCampaign.desc}
                  onChange={(e) => setNewCampaign({ ...newCampaign, desc: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Goal (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all pl-12"
                    placeholder="1.5"
                    value={newCampaign.goal}
                    onChange={(e) => setNewCampaign({ ...newCampaign, goal: e.target.value })}
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary font-bold">Ξ</div>
                </div>
              </div>
              <button 
                disabled={loading} 
                className="w-full py-4 bg-brand-primary text-brand-dark font-bold rounded-xl hover:bg-brand-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                type="submit"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                {loading ? "Initializing Contract..." : "Create Campaign"}
              </button>
            </form>
          </div>
        </section>

        {/* Active Campaigns Grid */}
        <section id="campaigns" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-brand-primary" />
                Active Projects
              </h2>
              <p className="text-slate-400">Find and support the next big thing on the blockchain.</p>
            </div>
            {campaigns.length > 0 && (
              <div className="text-sm text-slate-500 font-mono italic">
                {campaigns.length} campaigns discovered
              </div>
            )}
          </div>

          {loadingCampaigns ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
              <p className="text-slate-400">Scanning blockchain for campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
               <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <p className="text-slate-400">No campaigns found yet. Be the first to start one!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c, i) => {
                const raisedWei = c.amountRaised ? c.amountRaised.toString() : "0";
                const goalWei = c.goal ? c.goal.toString() : "1";
                const raised = parseFloat(formatEther(raisedWei));
                const goal = parseFloat(formatEther(goalWei));
                const progress = Math.min((raised / goal) * 100, 100);

                return (
                  <div key={i} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all flex flex-col shadow-lg hover:shadow-brand-primary/5 shadow-brand-dark">
                    <div className="h-2 w-full bg-slate-800">
                      <div 
                        className="h-full bg-brand-primary transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">{c.title}</h3>
                          <span className={`shrink-0 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${c.completed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
                            {c.completed ? "Goal Met" : "Active"}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{c.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-sm font-medium">
                        <div>
                          <p className="text-slate-500 text-xs">Raised</p>
                          <p className="text-brand-primary font-bold">{raised} ETH</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 text-xs">Goal</p>
                          <p className="text-white font-bold">{goal} ETH</p>
                        </div>
                      </div>

                      {!c.completed && (
                        <button
                          disabled={loadingFundCampaign === i.toString()}
                          onClick={() => fundCampaign(i.toString(), "0.01")}
                          className="w-full py-3 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-bold rounded-xl hover:bg-brand-primary hover:text-brand-dark transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                        >
                          {loadingFundCampaign === i.toString() ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wallet className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          )}
                          Fund 0.01 ETH
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-primary" />
            <span className="font-bold text-slate-100">SecureFund</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 SecureFund DApp. All rights reserved. Built with Security & Transparency.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors text-sm">Terms</a>
            <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors text-sm">Docs</a>
            <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors text-sm">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
