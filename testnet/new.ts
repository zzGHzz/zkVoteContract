import { Framework } from '@vechain/connex-framework'
import { Driver, SimpleNet, SimpleWallet, options } from '@vechain/connex-driver'

import { utils, connexutils } from 'myvetools'

const fs = require('fs')

import {
    accounts,
    abiVoteCreator, abiVotingContract,
    authPubKey, infoFile
} from './init'

(async () => {
    const wallet = new SimpleWallet()
    wallet.import(accounts[0].privKey)

    const driver = await Driver.connect(new SimpleNet('https://sync-testnet.vechain.org/'), wallet)
    const connex = new Framework(driver)

    const auth = accounts[0].pubKey
    const info = JSON.parse(fs.readFileSync(infoFile, 'utf8'))
    const addrVoteCreator = info.addrVoteCreator
    const addrVotingContract = info.addrVotingContract

    // Call VoteCreator.newBinaryVote
    let resp = await connexutils.contractCallWithTx(
        connex, auth, 10000000,
        addrVoteCreator, '0x0',
        utils.getABI(abiVoteCreator, 'newBinaryVote', 'function')
    )
    let rec = await connexutils.getReceipt(connex, 5, resp.txid)
    // There are three events emitted during this call. From top to bottom, they are:
    // 1. $Master
    // 2. VotingContract.NewBinaryVote
    // 3. VoteCreator.NewBinaryVote
    const voteID = rec.outputs[0].events[1].topics[1]

    console.log('Vote created:')
    console.log('\tvoteID: ', voteID)
    console.log('\ttxid: ', resp.txid)
    console.log('\tauth: ', auth)
    console.log('\tgas used:', rec.gasUsed)

    // Calling VotingContract.setAuthPubKey to set the authority public key
    resp = await connexutils.contractCallWithTx(
        connex, auth, 300000,
        addrVotingContract, '0x0',
        utils.getABI(abiVotingContract, 'setAuthPubKey', 'function'),
        voteID, [authPubKey.gkx, authPubKey.gky]
    )
    rec = await connexutils.getReceipt(connex, 5, resp.txid)
    
    console.log('Set authority public key:')
    console.log('\ttxid: ', resp.txid)
    console.log('\tPubKey: [', authPubKey.gkx, ', ', authPubKey.gky, ']')
    console.log('\tgas used:', rec.gasUsed)

    fs.writeFileSync(infoFile, JSON.stringify({
        addrVoteCreator: addrVoteCreator,
        addrVotingContract: addrVotingContract,
        voteID: voteID
    }))
})()