//SPDX-License-Identifier: MIT
// Specify the SPDX license identifier for the contract
pragma solidity ^0.8.19;
// Set the compiler version to 0.8.19 or newer

contract Crowdfunding {
// Define the contract named Crowdfunding
	struct Campaign{
	// Define a struct to hold the details of a crowdfunding campaign
		address payable owner;
		// The address of the campaign creator, payable to receive funds
		string title;
		// The title of the campaign
		string description;
		// A brief description of the campaign
		uint goal;
		// The funding goal in wei
		uint amountRaised;
		// The total amount of funds raised so far
		bool completed;
		// A flag to indicate if the campaign has reached its goal and transferred funds
	}
	// End of struct Campaign

	Campaign[] public campaigns;
	// Declare a public array to store all created campaigns

	event CampaignCreated(uint id, string title, uint goal);
	// Declare an event to be emitted when a new campaign is created
	event Funded(uint id, address contributor, uint amount);
	// Declare an event to be emitted when a campaign receives funds
	event GoalReached(uint id);
	// Declare an event to be emitted when a campaign reaches its funding goal

	function createCampaign(string memory _title, string memory _desc, uint _goal) external {
	// Function to create a new campaign
		require(_goal > 0, "Goal must be > 0");
		// Ensure the funding goal is greater than zero
		campaigns.push(Campaign(payable(msg.sender), _title, _desc, _goal, 0, false));
		// Create a new Campaign struct and add it to the campaigns array

		emit CampaignCreated(campaigns.length - 1, _title, _goal);
		// Emit the CampaignCreated event with the new campaign's ID
	}
	// End of createCampaign function

	function fund(uint _id) external payable {
	// Function to fund a specific campaign
		Campaign storage campaign = campaigns[_id];
		// Retrieve a reference to the specified campaign from storage
		require(!campaign.completed, "Campaign ended");
		// Ensure the campaign is not already completed
		require(msg.value > 0, "No ETH sent");
		// Ensure the sender has sent some Ether
		
		campaign.amountRaised += msg.value;
		// Add the sent Ether to the campaign's total raised amount

		if(campaign.amountRaised >= campaign.goal){
		// Check if the campaign has reached or exceeded its goal
			campaign.completed = true;
			// Mark the campaign as completed
			campaign.owner.transfer(campaign.amountRaised);
			// Transfer the total raised funds to the campaign owner
			emit GoalReached(_id);
			// Emit the GoalReached event
		}
		// End of goal check
	}
	// End of fund function

	function getCampaigns() external view returns (Campaign[] memory){
	// Function to retrieve all campaigns
		return campaigns;
		// Return the array of all campaigns
	}
	// End of getCampaigns function
}
// End of contract
