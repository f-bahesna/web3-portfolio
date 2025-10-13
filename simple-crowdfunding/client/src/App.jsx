import { useEffect, useState } from "react";
import { initWeb3 } from "./utils/web3";
import Web3 from "web3";

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

  const web3 = new Web3(window.ethereum);

  useEffect(() => {
    (async () => {
      const data = await initWeb3();
      setWeb3Data(data);
      loadCampaigns(data.contract);
    })();
  }, []);

  const loadCampaigns = async (contract) => {
    const campaigns = await contract.methods.getCampaigns().call();
    setCampaigns(campaigns);
    setLoadingCampaings(false);
  };

  const createCampaign = async (e) => {
    setLoading(true);
    e.preventDefault();
    const { contract, selectedAccount } = web3Data;

    try {
      await contract.methods
        .createCampaign(newCampaign.title, newCampaign.desc, newCampaign.goal)
        .send({ from: selectedAccount });
    } catch (error) {
      console.error("Smart contract revert:", error);
    }

    loadCampaigns(contract);
    setLoading(false);
  };

  const fundCampaign = async (id, amount) => {
    setLoadingFundCampaign(id);
    const { contract, selectedAccount, web3 } = web3Data;
    await contract.methods.fund(id).send({
      from: selectedAccount,
      value: web3.utils.toWei(amount, "ether"),
    });

    loadCampaigns(contract);
    setLoadingFundCampaign(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>FunFunding</h1>
      <p>
        <strong>Simple Web3 Crowdfunding DApp</strong> - A decentralized
        crowdfunding platform built using Solidity, React, and Web3.js. Users
        can create and fund campaigns directly on the blockchain with
        transparent goal tracking and no centralized system.
      </p>
      <form onSubmit={createCampaign}>
        <label>Create Campaign</label>
        <input
          style={{ padding: "10px", borderRadius: "10px", margin: "5px" }}
          placeholder="Title"
          onChange={(e) =>
            setNewCampaign({ ...newCampaign, title: e.target.value })
          }
        />
        <input
          style={{ padding: "10px", borderRadius: "10px", margin: "5px" }}
          placeholder="Description"
          onChange={(e) =>
            setNewCampaign({ ...newCampaign, desc: e.target.value })
          }
        />
        <input
          type="number"
          style={{ padding: "10px", borderRadius: "10px", margin: "5px" }}
          placeholder="Goal (ETH)"
          onChange={(e) =>
            setNewCampaign({ ...newCampaign, goal: e.target.value })
          }
        />
        <button disabled={loading} type="submit">
          {loading ? "Creating campaign..." : "Create"}
        </button>
      </form>

      <hr />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h3>
          {loadingCampaigns ? "Loading Campaigns..." : "Active Campaigns"}
        </h3>
      </div>
      {campaigns.map((c, i) => (
        <div
          key={i}
          style={{
            display: "inline-block",
            borderRadius: "20px",
            boxShadow: "0 2px 2px #ccc",
            border: "1px solid gray",
            width: "200px",
            margin: "20px",
            padding: "20px",
          }}
        >
          <h2>{c.title}</h2>
          <p>{c.description}</p>
          <p>
            Raised: {web3.utils.fromWei(c.amountRaised.toString(), "ether")} ETH
            / Goal: {web3.utils.fromWei(c.goal.toString(), "ether")} ETH
          </p>
          {!c.completed && (
            <button
              disabled={loadingFundCampaign}
              onClick={() => fundCampaign(i, "0.0001")}
            >
              {" "}
              {loadingFundCampaign === i ? "Processing..." : "Fund 0.0001 ETH"}
            </button>
          )}
          {c.completed && <strong>Goal Reached!</strong>}
        </div>
      ))}
    </div>
  );
}

export default App;
