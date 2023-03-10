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
            showConfirm: false,
            showAwait: false,
            showEventConfirmed: false,
            showError: false,
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

    async resetTimers() {
        const { contract } = this.state
        let willsCall = []
        const ethcallContract = new Contract(this.props.contractAddress, TheWill.abi)
        for (let i = 0; i < this.props.willsLength; i++) {
            willsCall.push(ethcallContract.getWill(this.props.signerAddress, i))
        }
        const wills = await this.props.ethcallProvider.all(willsCall)
        this.handleShowConfirm()
        await contract.resetTimers(wills.map(v => v.ID))
            .then(async (tx) => {
                this.handleCloseConfirm()
                this.handleShowAwait('Reset timers')
                await tx.wait()
                return tx.hash
            })
            .then((hash) => {
                this.handleCloseAwait()
                this.handleShowEventConfirmed('Timers has been reseted', hash)
                setTimeout(() => {
                    this.handleCloseEventConfirmed()
                }, 5000)
            })
            .catch((err) => {
                console.error(err)
                this.handleCloseConfirm()
                this.handleCloseAwait()
                this.handleShowError('Something went wrong')
                setTimeout(() => {
                    this.handleCloseError()
                }, 10000)
            })
    }

    resetTimers = this.resetTimers.bind(this)

    handleClose = () => this.setState({ show: false });
    handleShow = () => this.setState({ show: true });

    handleClose = this.handleClose.bind(this)
    handleShow = this.handleShow.bind(this)

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
                <Button id='reset-timers' variant="primary" className="btn_reset-timers" onClick={this.resetTimers}>
                    <h2 id='reset-timersh2' className='btn_reset-timers-h2'>RESET TIMERS</h2>
                    <h3 id='reset-timersh3' className='btn_reset-timers-h3'>I am active, and I still have access to my wallet</h3>
                </Button>
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