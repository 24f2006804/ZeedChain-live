// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./FractionalInvestment.sol";

contract StakeholderGovernance is ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;

    FractionalInvestment public immutable fractionalInvestment;
    
    struct Proposal {
        uint256 startupId;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
        address proposer;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 private nextProposalId;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_SHARES_TO_PROPOSE = 100;

    event ProposalCreated(uint256 indexed proposalId, uint256 indexed startupId, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 shares);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address payable _fractionalInvestment) {
        fractionalInvestment = FractionalInvestment(_fractionalInvestment);
    }

    function createProposal(uint256 startupId, string calldata description) external returns (uint256) {
        require(
            fractionalInvestment.getInvestorShares(startupId, msg.sender) >= MIN_SHARES_TO_PROPOSE,
            "Insufficient shares to propose"
        );

        uint256 proposalId = nextProposalId++;
        Proposal storage newProposal = proposals[proposalId];
        newProposal.startupId = startupId;
        newProposal.description = description;
        newProposal.deadline = block.timestamp + VOTING_PERIOD;
        newProposal.proposer = msg.sender;

        emit ProposalCreated(proposalId, startupId, description);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 shares = fractionalInvestment.getInvestorShares(proposal.startupId, msg.sender);
        require(shares > 0, "No shares owned");

        if (support) {
            proposal.votesFor += shares;
        } else {
            proposal.votesAgainst += shares;
        }

        proposal.hasVoted[msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, shares);
    }

    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.deadline, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not approved");

        proposal.executed = true;

        // Implementation for executing the proposal would go here
        // This could involve calls to other contracts based on the proposal type

        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (
        uint256 startupId,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 deadline,
        bool executed,
        address proposer
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.startupId,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.deadline,
            proposal.executed,
            proposal.proposer
        );
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
}