"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

interface Proposal {
  id: number;
  description: string;
  startupId: number;
  votes: number;
  active: boolean;
}

export default function GovernanceInterface({ startupId }: { startupId: number }) {
  const { web3Service } = useWeb3()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [newProposal, setNewProposal] = useState("")
  const [loading, setLoading] = useState(false)

  const createProposal = async () => {
    if (!web3Service?.contracts.governance) {
      toast.error('Governance contract not initialized')
      return
    }

    try {
      setLoading(true)
      const tx = await web3Service.contracts.governance.createProposal(
        startupId,
        newProposal
      )
      await tx.wait()
      toast.success('Proposal created successfully')
      setNewProposal("")
      // Refresh proposals
      fetchProposals()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create proposal')
    } finally {
      setLoading(false)
    }
  }

  const vote = async (proposalId: number, support: boolean) => {
    if (!web3Service?.contracts.governance) {
      toast.error('Governance contract not initialized')
      return
    }

    try {
      setLoading(true)
      const tx = await web3Service.contracts.governance.vote(proposalId, support)
      await tx.wait()
      toast.success('Vote cast successfully')
      // Refresh proposals
      fetchProposals()
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  const fetchProposals = async () => {
    if (!web3Service?.contracts.governance) return

    try {
      const proposalCount = await web3Service.contracts.governance.getProposalCount(startupId)
      const fetchedProposals = []
      
      for (let i = 0; i < proposalCount.toNumber(); i++) {
        const proposal = await web3Service.contracts.governance.getProposal(i)
        fetchedProposals.push({
          id: i,
          description: proposal.description,
          startupId: proposal.startupId.toNumber(),
          votes: proposal.votes.toNumber(),
          active: proposal.active
        })
      }

      setProposals(fetchedProposals)
    } catch (error) {
      console.error('Error fetching proposals:', error)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Create Proposal */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Create Proposal</h3>
            <Textarea
              placeholder="Enter your proposal..."
              value={newProposal}
              onChange={(e) => setNewProposal(e.target.value)}
            />
            <Button 
              onClick={createProposal}
              disabled={loading || !newProposal.trim()}
            >
              Submit Proposal
            </Button>
          </div>

          {/* Active Proposals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Active Proposals</h3>
            {proposals.length === 0 ? (
              <p className="text-gray-500">No active proposals</p>
            ) : (
              proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="pt-6">
                    <p className="mb-4">{proposal.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Votes: {proposal.votes}
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => vote(proposal.id, true)}
                          disabled={loading || !proposal.active}
                        >
                          Support
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => vote(proposal.id, false)}
                          disabled={loading || !proposal.active}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}