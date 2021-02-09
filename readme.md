# A Privacy-Preserved Voting Protocol Based on Zero-Knowledge Proof

## Introduction

This project implements the voting protocol described in [protocol.md](https://github.com/vechain-community/zkpvote-contracts/blob/master/protocol.md). There are three contracts:

* `BinaryVoteV2` implements functions for a binary vote. A binary vote is a vote where you can only vote yes or no. Note that the implementation uses the [P256 or Secp256r1](https://www.secg.org/sec2-v2.pdf) elliptic curve.
* `VotingContractV2` is responsible for hosting multiple instances of binary votes and the main entry for users to interact with a particular vote. The implemention adopts the second strategy described in [1] to manage multiple instances of a separate contract within a single contract. 

## Voting Protocol

### Pros
* Ballot privacy - no one except the voting authority knows the ballot contents.
* Ballot verifiable
	* Voters can verify the existence of their ballots.
	* Anyone can verify the validity of a recorded ballot.
	* Recorded ballots are immutable. 
* Tally results universally verifiable
	* Anyone can verify that all and only the valid ballots have been tallied.
	* Anyone can verify the correctness of the tally results.
* Voters are allowed to cast multiple times and the newer ballot will replace the previous one cast by the same voter.

### Cons
* The voting authority has to be trusted to keep ballot privacy and conduct timely tallying.

## Voting Process
The following is the whole voting process:

1. The voting authority creates a new vote via `VoteContractV2.newBinaryVote`.
2. The voting authority generates a key pair for the vote and register the public key via `VotingContractV2.setAuthPubKey`.
3. Voters generate a new key pair to computed their encrypted ballots and upload their ballots via `VotingContractV2.cast`.
4. The voting authority computes the tally result and upload the result via `VotingContractV2.setTallyRes`.
5. The voting authority ends the tally via `VotingContractV2.endTally`.
6. Anyone can verify the result via `VotingContractV2.verifyTallyRes`. They can also verify individual ballot via `VotingContractV2.verifyBallot`.

## License
The code is licensed under the [GNU Lesser General Public License v3.0](https://www.gnu.org/licenses/lgpl-3.0.en.html).