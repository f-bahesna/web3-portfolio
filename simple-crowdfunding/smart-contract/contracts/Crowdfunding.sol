//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Crowdfunding {
	struct Campaign{
		address payable owner;
		string title;
		string description;
		uint goal;
		uint amountRaised;
		bool completed;
	}

	Campaign[] public campaigns;

	event CampaignCreated(uint id, string title, uint goal);
	event Funded(uint id, address contributor, uint amount);
	event GoalReached(uint id);

	function createCampaign(string memory _title, string memory _desc, uint _goal) external {
		require(_goal > 0, "Goal must be > 0");
		campaigns.push(Campaign(payable(msg.sender), _title, _desc, _goal, 0, false));

		emit CampaignCreated(campaigns.length - 1, _title, _goal);
	}

	function fund(uint _id) external payable {
		Campaign storage campaign = campaigns[_id];
		require(!campaign.completed, "Campaign ended");
		require(msg.value > 0, "No ETH sent");
		
		campaign.amountRaised += msg.value;

		if(campaign.amountRaised >= campaign.goal){
			campaign.completed = true;
			campaign.owner.transfer(campaign.amountRaised);
			emit GoalReached(_id);
		}
	}

	function getCampaigns() external view returns (Campaign[] memory){
		return campaigns;
	}
}
