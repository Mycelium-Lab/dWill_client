import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { ethers } from "ethers"
import { Contract } from 'ethcall';

import TheWill from '../Contract/TheWill.json'
import closeModalPic from '../content/close_modal.svg'
import closePic from '../content/button_close.svg'
import linkBtn from '../content/link-btn.png'


class ResetTimers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            contractAddress: props.contractAddress,
            contract: null,
            showPrompt: false,
            showConfirm: false,
            showAwait: false,
            showEventConfirmed: false,
            showError: false,
            errortext: '',
            processingText: '',
            confirmedText: '',
            hash: ''
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(this.props.contractAddress, TheWill.abi, signer)
            this.setState({ signer, signerAddress, contract })
            const body = document.getElementsByTagName('body')
            // const App = document.getElementsByClassName('App')
            // const MainText = document.getElementsByClassName('main-text')
            // const HeaderBoxes = document.getElementsByClassName('header_boxes')
            // const NumberOfWills = document.getElementsByClassName('number-of-wills')
            // const _container = document.getElementsByClassName('_container')
            // const blockTwo = document.getElementsByClassName('block-two')
            // const blockThree = document.getElementsByClassName('block-three')
            // const pageData = document.getElementsByClassName('page-data')
            //for show confirm
            const modalContent = document.getElementsByClassName('modal-content')
            const modalConfirm = document.getElementsByClassName('modal-confirm')
            const modalConfirmText = document.getElementsByClassName('modal-confirm_text')
            const modalConfirmH2 = document.getElementsByClassName('modal-confirm_h2')
            const modalConfirmLoader = document.getElementsByClassName('ml-loader')
            body[0].addEventListener('click', (event) => {
                if (
                    this.state.showConfirm
                    &&
                    event.target !== modalContent[0]
                    &&
                    event.target !== modalContent[1]
                    &&
                    event.target !== modalConfirm[0]
                    &&
                    event.target !== modalConfirmText[0]
                    &&
                    event.target !== modalConfirmH2[0]
                    &&
                    event.target !== modalConfirmLoader[0]
                    &&
                    event.target.id !== 'reset-timers'
                    &&
                    event.target.id !== 'reset-timersh2'
                    &&
                    event.target.id !== 'reset-timersh3'
                ) {
                    console.log(event.target)
                    this.handleCloseConfirm()
                }
            })
        } catch (error) {
            console.error(error)
        }
    }

    resetTimers = () => {
        this.handleShowPrompt()
    }

    confirmResetTimers = async () => {
        this.handleClosePrompt()
        const { contract } = this.state
        if (!contract || !this.props.willsLength) {
            this.handleShowError('No active dWills to reset')
            setTimeout(() => this.handleCloseError(), 5000)
            return
        }

        let wills = []
        try {
            try {
                const ethcallContract = new Contract(this.props.contractAddress, TheWill.abi)
                const willsCall = []
                for (let i = 0; i < this.props.willsLength; i++) {
                    willsCall.push(ethcallContract.getWill(this.props.signerAddress, i))
                }
                wills = await this.props.ethcallProvider.all(willsCall)
            } catch (multicallErr) {
                console.warn('Multicall failed, falling back to direct calls', multicallErr)
                wills = []
                for (let i = 0; i < this.props.willsLength; i++) {
                    // eslint-disable-next-line no-await-in-loop
                    const w = await contract.getWill(this.props.signerAddress, i)
                    wills.push(w)
                }
            }

            if (!wills.length) {
                this.handleShowError('No active dWills to reset')
                setTimeout(() => this.handleCloseError(), 5000)
                return
            }

            this.handleShowConfirm()
            const tx = await contract.resetTimers(wills.map(v => v.ID))
            this.handleCloseConfirm()
            this.handleShowAwait('Reset timers')
            await tx.wait()
            this.handleCloseAwait()
            this.handleShowEventConfirmed('Timers have been reset', tx.hash)
            setTimeout(() => this.handleCloseEventConfirmed(), 5000)
        } catch (err) {
            console.error(err)
            this.handleCloseConfirm()
            this.handleCloseAwait()
            const message = (err && (err.message || err.reason || '')) + ''
            const userRejected =
                (err && err.code === 4001) ||
                /user (denied|rejected)/i.test(message) ||
                /ACTION_REJECTED/i.test(message)
            if (!userRejected) {
                this.handleShowError('Something went wrong. Please try again.')
                setTimeout(() => this.handleCloseError(), 8000)
            }
        }
    }

    handleClose = () => this.setState({ show: false });
    handleShow = () => this.setState({ show: true });

    handleClose = this.handleClose.bind(this)
    handleShow = this.handleShow.bind(this)

    handleShowPrompt = () => this.setState({ showPrompt: true })
    handleClosePrompt = () => this.setState({ showPrompt: false })

    handleShowConfirm = () => this.setState({ showConfirm: true })
    handleShowAwait = (processingText) => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showConfirm: false, showAwait: true, processingText })
    }
    handleCloseConfirm = () => this.setState({ showConfirm: false })
    handleCloseAwait = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.remove('small-modal')
        this.setState({ showAwait: false })
    }
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
            <div>
                <Button
                    id='reset-timers'
                    variant="primary"
                    className="btn_reset-timers"
                    onClick={this.resetTimers}
                    title="I am active, and I still have access to my wallet"
                >
                    <span id='reset-timersh2' className='btn_reset-timers-label'>Reset timers</span>
                </Button>
                <Modal
                    show={this.state.showPrompt}
                    onHide={this.handleClosePrompt}
                    className="modal-prompt"
                    centered
                    backdrop="static"
                >
                    <div className="modal-prompt__body">
                        <h2 className="modal-prompt__title">Reset all timers</h2>
                        <p className="modal-prompt__text">
                            This resets the inactivity countdown for every active dWill you own.
                            You'll be asked to confirm the transaction in your wallet.
                        </p>
                        <div className="modal-prompt__actions">
                            <button
                                type="button"
                                className="modal-prompt__btn modal-prompt__btn--secondary"
                                onClick={this.handleClosePrompt}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="modal-prompt__btn modal-prompt__btn--primary"
                                onClick={this.confirmResetTimers}
                            >
                                Reset timers
                            </button>
                        </div>
                    </div>
                </Modal>
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
                        <button className="btn-close-modal btn btn-primary">
                            <img src={closeModalPic} alt="Close"></img>
                        </button>
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
                            <img src={linkBtn} alt="Loading"></img>
                        </a>
                        <Button variant="danger" onClick={this.handleCloseEventConfirmed} className="btn btn-danger">
                            <img src={closePic} alt="Close"/>
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal className="modal-loading modal-loading--process" show={this.state.showAwait}>
                    <Modal.Header>
                        <div className="modal_confirm">
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
            </div>
        )
    }
}

export default ResetTimers;