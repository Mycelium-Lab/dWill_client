import React, { Component } from 'react'
import { ethers } from "ethers"
import { Contract } from 'ethcall';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import { chainIDs } from '../Utils/Constants'
import { tooltipText } from '../Utils/tooltipText'
import TheWill from '../Contract/TheWill.json'
import ERC20 from '../Contract/ERC20.json'

import closePic from '../content/button_close.svg'
import closeModalPic from '../content/close_modal.svg'
import receivePic from '../content/receive.svg'
import ConfiPic from '../content/confi.svg'
import linkBtn from '../content/link-btn.png'
import infoBtn from '../content/info-btn.svg'

class Inheritances extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            network: '',
            approved: false,
            tokenAddress: '',
            tokenSymbol: '',
            tokenDecimals: '',
            tokensValue: '',
            contractAddress: props.contractAddress,
            year: '',
            month: '',
            day: '',
            heirAddress: '',
            contract: null,
            inheritances: [],
            showConfirm: false,
            showAwait: false,
            showEventConfirmed: false,
            processingText: '',
            confirmedText: '',
            showError: false,
            hash: '',
            showReceiveConfirmed: false
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(this.props.contractAddress, TheWill.abi, signer)
            const ethcallContract = new Contract(this.props.contractAddress, TheWill.abi)
            const inheritancesLength = await contract.getInheritancesLength(signerAddress)
            let inheritancesCall = []
            for (let i = 0; i < inheritancesLength; i++) {
                inheritancesCall.push(ethcallContract.getInheritance(signerAddress, i))
            }
            const inheritances = await this.props.ethcallProvider.all(inheritancesCall)
            let _inheritances = [];
            for (let i = 0; i < inheritances.length; i++) {
                const token = new ethers.Contract(inheritances[i].token, ERC20.abi, signer)
                const symbol = await token.symbol()
                const decimals = await token.decimals()
                _inheritances[i] = {
                    ID: inheritances[i].ID.toString(),
                    amount: inheritances[i].amount.toString(),
                    done: inheritances[i].done,
                    heir: inheritances[i].heir,
                    owner: inheritances[i].owner,
                    timeWhenWithdraw: inheritances[i].withdrawalTime.toString(),
                    token: inheritances[i].token,
                    symbol,
                    decimals
                }
            }
            let networkName
            if (this.props.network === chainIDs.BinanceMainnet) {
                networkName = `BNB Chain`
            } else if (this.props.network === chainIDs.Polygon) {
                networkName = `Polygon`
            } else if (this.props.network === 31337) {
                networkName = `Hardhat`
            } else if (this.props.network === chainIDs.Mumbai) {
                networkName = `Mumbai`
            } else if (this.props.network === chainIDs.Goerli) {
                networkName = `Goerli`
            } else if (this.props.network === chainIDs.EthereumMainnet) {
                networkName = `Ethereum`
            } else if (this.props.network === chainIDs.BinanceTestnet) {
                networkName = `BNBTest Chain`
            }
            contract.on('AddWill', async (ID, owner, heir, token, timeWhenWithdraw, amount) => {
                try {
                    let __inheritances = this.state.inheritances
                    if (heir.toLowerCase() === signerAddress.toLowerCase()) {
                        const inheritance = await contract.willData(ID.toString())
                        const token = new ethers.Contract(inheritance.token, ERC20.abi, signer)
                        const symbol = await token.symbol()
                        const decimals = await token.decimals()
                        let exist = false
                        for (let i = 0; i < __inheritances.length; i++) {
                            if (__inheritances[i].ID === inheritance.ID.toString()) {
                                exist = true
                            }
                        }
                        if (exist === false) {
                            __inheritances.push({
                                ID: inheritance.ID.toString(),
                                amount: inheritance.amount.toString(),
                                done: inheritance.done,
                                heir: inheritance.heir,
                                owner: inheritance.owner,
                                timeWhenWithdraw: inheritance.withdrawalTime.toString(),
                                token: inheritance.token,
                                symbol,
                                decimals
                            })
                        }
                        this.setState({ inheritances: __inheritances })
                    }
                } catch (error) {
                    console.error(error)
                }
            })
            contract.on('Withdraw', async (ID, owner, heir, token, timeWhenWithdraw, amount) => {
                try {
                    let __inheritances = this.state.inheritances
                    if (heir.toLowerCase() === signerAddress.toLowerCase()) {
                        __inheritances = __inheritances.filter(v => v.ID !== ID.toString())
                        this.setState({ inheritances: __inheritances })
                    }
                } catch (error) {
                    console.error(error)
                }
            })
            contract.on('RemoveWill', async (ID, owner, heir) => {
                try {
                    let __inheritances = this.state.inheritances
                    if (heir.toLowerCase() === signerAddress.toLowerCase()) {
                        __inheritances = __inheritances.filter(v => v.ID !== ID.toString())
                        this.setState({ inheritances: __inheritances })
                    }
                } catch (error) {
                    console.error(error)
                }
            })
            contract.on('UpdateWithdrawalTime', async (ID, lastTime, newTime)  => {
                try {
                    const heir = (await contract.willData(ID)).heir
                    if (heir.toLowerCase() === signerAddress.toLowerCase()) {
                        let __inheritances = this.state.inheritances
                        for (let i = 0; i < __inheritances.length; i++) {
                            if (__inheritances[i].ID === ID.toString()) {
                                const __will = await contract.inheritanceData(ID.toString())
                                __inheritances[i].timeWhenWithdraw = newTime.toString()
                                __inheritances[i].timeBetweenWithdrawAndStart = __will.timeBetweenWithdrawAndStart
                            }
                        }
                        this.setState({
                            inheritances: __inheritances
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            })
            contract.on('UpdateHeir', async (ID, oldHeir, heir) => {
                try {
                    const heir = (await contract.willData(ID)).heir
                    let __inheritances = this.state.inheritances
                    __inheritances = __inheritances.filter(v => v.ID.toString() !== ID.toString())
                    if (heir.toLowerCase() === signerAddress.toLowerCase()) {
                        const inheritance = await contract.willData(ID.toString())
                        const token = new ethers.Contract(inheritance.token, ERC20.abi, signer)
                        const symbol = await token.symbol()
                        const decimals = await token.decimals()
                        __inheritances.push({
                            ID: inheritance.ID.toString(),
                            amount: inheritance.amount.toString(),
                            done: inheritance.done,
                            heir: inheritance.heir,
                            owner: inheritance.owner,
                            timeWhenWithdraw: inheritance.withdrawalTime.toString(),
                            token: inheritance.token,
                            symbol,
                            decimals
                        })
                    }
                    this.setState({
                        inheritances: __inheritances
                    })
                } catch (error) {
                    console.log(error)
                }
            })
            contract.on('UpdateAmount', async (ID, oldAmount, newAmount) => {
                try {
                    const heir = (await contract.willData(ID)).heir
                    if (heir.toLowerCase() === signerAddress.toLowerCase()) {
                        let __inheritances = this.state.inheritances
                        for (let i = 0; i < __inheritances.length; i++) {
                            if (__inheritances[i].ID === ID.toString()) {
                                __inheritances[i].amount = newAmount.toString()
                            }
                        }
                        this.setState({
                            inheritances: __inheritances
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            })
            this.setState({ signer, signerAddress, contract, inheritances: _inheritances, network: networkName })
            const body = document.getElementsByTagName('body')
            const modal = document.getElementsByClassName('fade modal-await modal show')
            const modalContent = document.getElementsByClassName('modal-content')
            const modalFooter = document.getElementsByClassName('modal-footer')
            const modalImage = document.getElementById('modal-done-image')
            const modalText = document.getElementsByClassName('modal-await_text')
            const text = document.getElementsByClassName('modal-await_text modal-await_text__second')
            body[0].addEventListener('click', (event) => {
                const addTokenButton = document.getElementById('add-token')
                const blockExplorerButton = document.getElementById('block-explorer')
                if (
                    this.state.showReceiveConfirmed === true
                    &&
                    (
                        event.target !== modal[0]
                        &&
                        event.target !== modalContent[0]
                        &&
                        event.target !== addTokenButton
                        &&
                        event.target !== blockExplorerButton
                        &&
                        event.target !== modalImage
                        &&
                        event.target !== modalFooter[0]
                        &&
                        event.target !== modalText[0]
                        &&
                        event.target !== text[0]
                    )
                ) {
                    this.handleCloseReceiveConfirmed()
                }
            })
        } catch (error) {
            console.log('hrere')
            console.error(error)
        }
    }

    async claim(event) {
        const contract = this.state.contract
        try {
            this.handleShowConfirm()
            const will = await contract.inheritanceData(event.target.value)
            await contract.withdraw(event.target.value)
                .then(async (tx) => {
                    this.handleShowAwait(`Receive tokens`)
                    await tx.wait()
                    this.handleCloseAwait()
                    const token = new ethers.Contract(will.token, ERC20.abi, this.props.signer)
                    const _symbol = await token.symbol()
                    const _decimals = await token.decimals()
                    this.handleShowReceiveConfirmed(will.token, _symbol, _decimals, tx.hash)
                })
        } catch (error) {
            console.error(error)
            this.handleCloseConfirm()
            this.handleCloseAwait()
            if (error.reason.includes('dWill: Time is not over yet')) {
                this.handleShowError('Time is not over yet')
            } else {
                this.handleShowError('Something went wrong')
            }
            setTimeout(() => {
                this.handleCloseError()
            }, 10000)
        }
    }

    remainingTime(timeWhenWithdraw) {
        const _timeNow = new Date()
        const _timeWhenWithdraw = new Date(parseInt(timeWhenWithdraw) * 1000)
        if (_timeWhenWithdraw < _timeNow) {
            return 'Nothing.'
        } else {
            const seconds = Math.floor((new Date(_timeWhenWithdraw - _timeNow)).getTime() / 1000)
            let y = Math.floor(seconds / 31536000);
            let mo = Math.floor((seconds % 31536000) / 2628000);
            let d = Math.floor(((seconds % 31536000) % 2628000) / 86400);
            let h = Math.floor((seconds % (3600 * 24)) / 3600);
            const zeroYearText = " 0 years,"
            const zeroMonthText = " 0 months,"
            const zeroDayText = " 0 days, "
            const zeroHourText = " 0 hours "
            let yDisplay = y > 0 ? y + (y === 1 ? " year, " : " years, ") : zeroYearText ;
            let moDisplay = mo > 0 ? mo + (mo === 1 ? " month, " : " months, ") : zeroMonthText ;
            let dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : zeroDayText ;
            let hDisplay = h > 0 ? h + (h === 1 ? " hour " : " hours ") : zeroHourText ;
            const toReturn = yDisplay + moDisplay + dDisplay + hDisplay + ' '
            const toReturnZero = zeroYearText + zeroMonthText + zeroDayText + zeroHourText + ' '
            return toReturn === toReturnZero ? ' less than an hour ' : toReturn;
        }
    }

    checkIfTimeIsEnd(timeWhenWithdraw) {
        const timeNow = (new Date().getTime())
        const timeFrom = (new Date(parseInt(timeWhenWithdraw) * 1000)).getTime()
        if (timeNow > timeFrom) {
            return true
        } else {
            return false
        }
    }

    addTokenToWallet() {
        try {
            if (localStorage.getItem('wallet') === 'Metamask') {
                window.ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20', // Initially only supports ERC20, but eventually more!
                        options: {
                            address: this.state.tokenAddress, // The address that the token is at.
                            symbol: this.state.tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                            decimals: this.state.tokenDecimals // The number of decimals in the token
                        },
                    },
                })
            } else {
                this.handleShowError('WalletConnect does not support this function')
                setTimeout(() => {
                    this.handleCloseError()
                }, 10000)
            }
        } catch (error) {
            this.handleShowError('Something went wrong')
            setTimeout(() => {
                this.handleCloseError()
            }, 10000)
        }
    }

    addTokenToWallet = this.addTokenToWallet.bind(this)

    remainingTime = this.remainingTime.bind(this)
    checkIfTimeIsEnd = this.checkIfTimeIsEnd.bind(this)
    claim = this.claim.bind(this)

    handleShowConfirm = () => this.setState({ showConfirm: true })
    handleShowAwait = (processingText) => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showConfirm: false, showAwait: true, processingText })
    }
    handleCloseConfirm = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.remove('small-modal')
        this.setState({ showConfirm: false })
    }
    handleCloseAwait = () => this.setState({ showAwait: false })
    handleShowConfirm = this.handleShowConfirm.bind(this)
    handleShowAwait = this.handleShowAwait.bind(this)
    handleCloseConfirm = this.handleCloseConfirm.bind(this)
    handleCloseAwait = this.handleCloseAwait.bind(this)

    handleShowEventConfirmed = (confirmedText, hash) => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showEventConfirmed: true, confirmedText, hash })
    }
    handleCloseEventConfirmed = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.remove('small-modal')
        this.setState({ showEventConfirmed: false })
    }

    handleShowEventConfirmed = this.handleShowEventConfirmed.bind(this)
    handleCloseEventConfirmed = this.handleCloseEventConfirmed.bind(this)

    handleShowReceiveConfirmed = (tokenAddress, tokenSymbol, tokenDecimals, hash) => this.setState({
        showReceiveConfirmed : true,
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        hash
    })
    handleCloseReceiveConfirmed = () => {
        this.setState({
        showReceiveConfirmed : false,
        tokenAddress: '',
        tokenSymbol: '',
        tokenDecimals: '',
        hash: ''
    })}

    handleShowReceiveConfirmed = this.handleShowReceiveConfirmed.bind(this)
    handleCloseReceiveConfirmed = this.handleCloseReceiveConfirmed.bind(this)

    handleShowError = (errortext) => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showError: true, errortext })
    }
    handleCloseError = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.remove('small-modal')
        this.setState({ showError: false })
    }

    handleShowError = this.handleShowError.bind(this)
    handleCloseError = this.handleCloseError.bind(this)

    render() {
        return (
            <div className='your_inheritances wills-description-block'>
                <div className="your_inheritances_ul-text__head">
                    <h3 className='your_inheritances-h3'>Your inheritances</h3>
                    <div className="your-wills__info-message" data-title={tooltipText.inheritances}>
                    <img src={infoBtn} alt="Info"></img>
                    </div>
                </div>
                {
                    this.state.inheritances.length > 0
                        ?
                        <div className='your_inheritances_ul-btn'>
                            <ul className='your_inheritances_ul'>
                                {
                                    this.state.inheritances.map((v) => {
                                        return (
                                            <li key={v.ID} style={{  }}>
                                                <div className='your_inheritances_ul-text'>
                                                    <div className="wills-description-block__header">
                                                        <div className="wills-description-block__col">
                                                            <span className="wills-description-block__id">dWill #{v.ID.toString()} </span>
                                                            <span>
                                                                {
                                                                    this.remainingTime(v.timeWhenWithdraw) === 'Nothing.'
                                                                        ?
                                                                        'You '
                                                                        :
                                                                        <span>
                                                                            <span>After </span>
                                                                            <span className='your-wills_remain'>{this.remainingTime(v.timeWhenWithdraw)}</span>
                                                                            <span>you </span>
                                                                        </span>
                                                                }
                                                                can harvest {v.amount.toString() === ethers.constants.MaxUint256.toString() ? <span className="wills-description-block__symbol">all</span> : <span className="wills-description-block__symbol">{(v.amount / Math.pow(10, v.decimals)).toString()}</span>} <span className="wills-description-block__symbol">{v.symbol}</span> from wallet
                                                            </span>
                                                            <a href={`${this.props.networkProvider}/address/${v.owner}`} target="_blank" rel="noreferrer">{` ${v.owner}`}</a> on <span className="wills-description-block__symbol">{this.state.network}</span> chain
                                                        </div>
                                                        <button value={v.ID.toString()} onClick={this.claim}
                                                            style={{
                                                                display: this.checkIfTimeIsEnd(v.timeWhenWithdraw) ? 'flex' : 'none'
                                                            }} className="btn_btn-success">
                                                            <img src={receivePic} alt="Receive"></img>Receive
                                                        </button>
                                                    </div>

                                                </div>

                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        :
                        <h4>You don't have active inheritances yet.</h4>
                }
                <Modal show={this.state.showConfirm} className="modal-confirm">
                    <Modal.Header>
                        <h2 className='modal-confirm_h2'>Pending  transaction</h2>
                    </Modal.Header>
                    <div className="ml-loader">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    <Modal.Footer>
                        <p className="modal-confirm_text">Please confirm transaction in your web3 wallet</p>
                    </Modal.Footer>
                </Modal>
                <Modal className="modal-loading modal-loading--process" show={this.state.showEventConfirmed}>
                    <Modal.Header>
                        <div className="modal_confirm">
                            <h2 className="modal-loading__title modal-loading__title--confirmed">Confirmed!</h2>
                            <p className="modal-loading__subtitle">{this.state.confirmedText}</p>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--confirmed">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <a className="modal-loading__link" href={`${this.props.networkProvider}/tx/${this.state.hash}`} target="_blank" rel="noreferrer">
                            <img src={linkBtn} alt="Link"></img>
                        </a>
                        <Button variant="danger" onClick={this.handleCloseEventConfirmed} className="btn btn-danger">
                            <img src={closePic} alt="Close"/>
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal className="modal-loading modal-loading--process" show={this.state.showAwait}>
                    <Modal.Header>
                        <div className="className='modal_confirm">
                            <h2 className="modal-loading__title modal-loading__title--processing">Processing...</h2>
                            <p className="modal-loading__subtitle">{this.state.processingText}</p>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--processing">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.handleCloseAwait} className="btn btn-danger">
                            <img src={closePic} alt="Close"/>
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal className="modal-loading modal-loading--process" show={this.state.showError}>
                    <Modal.Header>
                        <div className="modal_confirm">
                            <h2 className="modal-loading__title modal-loading__title--error">Error</h2>
                            <div className="modal-loading__subtitle">{this.state.errortext}</div>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--error">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" className="btn btn-danger" onClick={this.handleCloseError}>
                            <img src={closePic} alt="Close"/>
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showReceiveConfirmed} className="modal-await">
                    <img id="modal-done-image" src={ConfiPic} alt="confi" />
                    <Modal.Footer>
                        <button className="btn-close-modal btn btn-primary" onClick={this.handleCloseReceiveConfirmed}>
                            <img src={closeModalPic} alt="Close"></img>
                        </button>
                        <p className="modal-await_text">?????????????????? ?????????????? ????????????????!</p>
                        <p className="modal-await_text modal-await_text__second">
                            <span id='add-token' onClick={this.addTokenToWallet}>
                                Add token to wallet
                            </span>
                            <br/>
                            <a id='block-explorer' href={`${this.props.networkProvider}/tx/${this.state.hash}`} target="_blank" rel="noreferrer">
                                View in blockchain explorer
                            </a>
                        </p>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Inheritances;