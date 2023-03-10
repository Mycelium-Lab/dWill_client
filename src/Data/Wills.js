/* global BigInt */

import React, { Component } from 'react';
import { ethers } from "ethers";
import { Contract } from 'ethcall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import TheWill from '../Contract/TheWill.json'
import ERC20 from '../Contract/ERC20.json'
import { chainIDs } from '../Utils/Constants';
import { createRightEditTime } from '../Utils/Time';
import { tooltipText } from '../Utils/tooltipText';

import editPic from '../content/edit.svg'
import revokePic from '../content/revoke.svg'
import closePic from '../content/button_close.svg'
import PolygonPic from '../content/poligon.svg'
import BinancePic from '../content/binance.svg'
import EthereumPic from '../content/ethereum.svg'
import AvalanchePic from '../content/avalanche.svg'
import OptimismPic from '../content/optimism.svg'
import ArbitrumPic from '../content/arbitrum.svg'
import btnTelegram from '../content/btnTelegram.svg'
import btnCalendar from '../content/btnCalendar.svg'
import btnEmail from '../content/btnEmail.svg'
import infoBtn from '../content/info-btn.svg'
import linkBtn from '../content/link-btn.png'

class Wills extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            tokenAddress: '',
            amount: '',
            showConfirm: false,
            showAwait: false,
            showEdit: false,
            showEditTimeWhenWithdraw: false,
            showEditHeir: false,
            showEventConfirmed: false,
            currentEditID: '',
            currentEditBaseHeirAddress: '',
            currentEditHeirAddress: '',
            currentEditTimeWhenWithdraw: '',
            currentEditTimeBetweenWithdrawAndStart: '',
            currentEditToken: '',
            currentEditSymbol: '',
            currentEditBaseAmount: '',
            currentEditAmount: '',
            currentEditDecimals: 0,
            isUnlimitedAmount: false,
            isUnlimitedAmountBase: false,
            updateHeir: false,
            updateAmount: false,
            time: '',
            network: '',
            approved: true,
            tokensValueToApprove: '',
            contractAddress: props.contractAddress,
            baseYear: 0,
            baseMonth: 0,
            baseDay: 0,
            baseHour: 0,
            year: 0,
            month: 0,
            day: 0,
            heirAddress: '',
            contract: null,
            wills: [],
            showError: false,
            errortext: '',
            notificationsOn: false,
            networkPic: EthereumPic,
            processingText: '',
            confirmedText: '',
            googleCalendarDateText: '',
            hash: '',
            limitedText: 'unlimited',
            isAddress: true
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(this.props.contractAddress, TheWill.abi, signer)
            const ethcallContract = new Contract(this.props.contractAddress, TheWill.abi)
            const willsLength = await contract.getWillsLength(signerAddress)
            let willsCall = []
            for (let i = 0; i < willsLength; i++) {
                willsCall.push(ethcallContract.getWill(signerAddress, i))
            }
            const wills = await this.props.ethcallProvider.all(willsCall)
            let _wills = [];
            for (let i = 0; i < wills.length; i++) {
                const token = new ethers.Contract(wills[i].token, ERC20.abi, signer)
                const symbol = await token.symbol()
                const decimals = await token.decimals()
                _wills[i] = {
                    ID: wills[i].ID.toString(),
                    amount: wills[i].amount.toString(),
                    done: wills[i].done,
                    heir: wills[i].heir,
                    owner: wills[i].owner,
                    timeWhenWithdraw: wills[i].withdrawalTime.toString(),
                    timeBetweenWithdrawAndStart: wills[i].timeInterval.toString(),
                    token: wills[i].token,
                    symbol,
                    decimals
                }
            }
            let networkPic
            if (this.props.network === chainIDs.Mumbai) {
                networkPic = PolygonPic
            } else if (this.props.network === chainIDs.Goerli) {
                networkPic = EthereumPic
            } else if (this.props.network === chainIDs.Polygon) {
                networkPic = PolygonPic
            } else if (this.props.network === chainIDs.BinanceTestnet) {
                networkPic = BinancePic
            } else if (this.props.network === chainIDs.BinanceMainnet) {
                networkPic = BinancePic
            } else if (this.props.network === chainIDs.EthereumMainnet) {
                networkPic = EthereumPic
            } else if (this.props.network === chainIDs.AvalancheMainnet) {
                networkPic = AvalanchePic
            } else if (this.props.network === chainIDs.OptimismMainnet) {
                networkPic = OptimismPic
            } else if (this.props.network === chainIDs.ArbitrumMainnet) {
                networkPic = ArbitrumPic
            }
            this.setState({ signer, signerAddress, contract, wills: _wills, networkPic })
            contract.on('AddWill', async (ID, owner, heir, token, timeWhenWithdraw, amount) => {
                try {
                    if (owner.toLowerCase() === signerAddress.toLowerCase()) {
                        let __wills = this.state.wills
                        const will = await contract.willData(ID.toString())
                        const token = new ethers.Contract(will.token, ERC20.abi, signer)
                        const symbol = await token.symbol()
                        const decimals = await token.decimals()
                        let exist = false
                        for (let i = 0; i < __wills.length; i++) {
                            if (__wills[i].ID === will.ID.toString()) {
                                exist = true
                            }
                        }
                        if (exist === false) {
                            __wills.push({
                                ID: will.ID.toString(),
                                amount: will.amount.toString(),
                                done: will.done,
                                heir: will.heir,
                                owner: will.owner,
                                timeWhenWithdraw: will.withdrawalTime.toString(),
                                timeBetweenWithdrawAndStart: will.timeInterval.toString(),
                                token: will.token,
                                symbol,
                                decimals
                            })
                        }
                        this.setState({ wills: __wills })
                    }
                } catch (error) {
                    console.error(error)
                }
            })
            contract.on('Withdraw', async (ID, owner, heir, token, timeWhenWithdraw, amount) => {
                try {
                    if (owner.toLowerCase() === signerAddress.toLowerCase()) {
                        let __wills = this.state.wills
                        __wills = __wills.filter(v => v.ID !== ID.toString())
                        this.setState({ wills: __wills })
                    }
                } catch (error) {
                    console.error(error)
                }
            })
            contract.on('RemoveWill', async (ID, owner, heir) => {
                try {
                    if (owner.toLowerCase() === signerAddress.toLowerCase()) {
                        let __wills = this.state.wills
                        __wills = __wills.filter(v => v.ID !== ID.toString())
                        this.setState({ wills: __wills })
                    }
                } catch (error) {
                    console.error(error)
                }
            })
            contract.on('UpdateWithdrawalTime', async (ID, lastTime, newTime) => {
                try {
                    const owner = (await contract.willData(ID)).owner
                    if (owner.toLowerCase() === signerAddress.toLowerCase()) {
                        let __wills = this.state.wills
                        for (let i = 0; i < __wills.length; i++) {
                            if (__wills[i].ID === ID.toString()) {
                                const __will = await contract.inheritanceData(ID.toString())
                                __wills[i].timeWhenWithdraw = newTime.toString()
                                __wills[i].timeBetweenWithdrawAndStart = __will.timeBetweenWithdrawAndStart
                            }
                        }
                        this.setState({
                            wills: __wills
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            })
            contract.on('UpdateHeir', async (ID, oldHeir, heir) => {
                try {
                    const owner = (await contract.willData(ID)).owner
                    if (owner.toLowerCase() === signerAddress.toLowerCase()) {
                        let __wills = this.state.wills
                        for (let i = 0; i < __wills.length; i++) {
                            if (_wills[i].ID === ID.toString()) {
                                _wills[i].heir = heir
                            }
                        }
                        this.setState({
                            wills: __wills
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            })
            contract.on('UpdateAmount', async (ID, oldAmount, newAmount) => {
                try {
                    const owner = (await contract.willData(ID)).owner
                    if (owner.toLowerCase() === signerAddress.toLowerCase()) {
                        let __wills = this.state.wills
                        for (let i = 0; i < __wills.length; i++) {
                            if (_wills[i].ID === ID.toString()) {
                                _wills[i].amount = newAmount.toString()
                            }
                        }
                        this.setState({
                            wills: __wills
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            })
            const body = document.getElementsByTagName('body')
            const App = document.getElementsByClassName('App')
            const MainText = document.getElementsByClassName('main-text')
            const HeaderBoxes = document.getElementsByClassName('header_boxes')
            const NumberOfWills = document.getElementsByClassName('number-of-wills')
            const _container = document.getElementsByClassName('_container')
            const blockTwo = document.getElementsByClassName('block-two')
            const blockThree = document.getElementsByClassName('block-three')
            const pageData = document.getElementsByClassName('page-data')
            //for show confirm
            const modalContent = document.getElementsByClassName('modal-content')
            const modalConfirm = document.getElementsByClassName('modal-confirm')
            const modalConfirmText = document.getElementsByClassName('modal-confirm_text')
            const modalConfirmH2 = document.getElementsByClassName('modal-confirm_h2')
            const modalConfirmLoader = document.getElementsByClassName('ml-loader')
            body[0].addEventListener('click', (event) => {
                const exist = document.getElementsByClassName('fade will-block modal show')
                if (
                    this.state.showEdit
                    &&
                    (
                        event.target === App[0]
                        ||
                        event.target === MainText[0]
                        ||
                        event.target === HeaderBoxes[0]
                        ||
                        event.target === NumberOfWills[0]
                        ||
                        event.target === _container[0]
                        ||
                        event.target === blockTwo[0]
                        ||
                        event.target === blockTwo[1]
                        ||
                        event.target === blockThree[0]
                        ||
                        event.target === pageData[0]
                        ||
                        event.target === exist[0]
                    )
                ) {
                    this.handleCloseEdit()
                }
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
                    event.target.id !== 'revoke'
                ) {
                    this.handleCloseConfirm()
                }
            })
        } catch (error) {
            console.error(error)
        }
    }

    timeConverter(UNIX_timestamp) {
        var a = new Date(parseInt(UNIX_timestamp) * 1000);
        var year = a.getFullYear();
        var month = a.getMonth();
        var date = a.getDate();
        month += 1
        var time = `${date < 10 ? '0' + date : date}` + '.' + `${month < 10 ? '0' + month : month}` + '.' + year;
        return time;
    }

    timeBetweenWithdrawAndStartConverter(time) {
        let seconds = parseInt(time)
        let y = Math.floor(seconds / 31536000);
        let mo = Math.floor((seconds % 31536000) / 2628000);
        let d = Math.floor(((seconds % 31536000) % 2628000) / 86400);
        let yDisplay = y > 0 ? y + (y === 1 ? " year " : " years ") : "";
        let moDisplay = mo > 0 ? mo + (mo === 1 ? " month " : " months ") : "";
        let dDisplay = d > 0 ? d + (d === 1 ? " day " : " days ") : "";
        return yDisplay + moDisplay + dDisplay
    }

    timeBetweenWithdrawAndStartConverterNumbers(time) {
        let seconds = parseInt(time)
        let y = Math.floor(seconds / 31536000);
        let mo = Math.floor((seconds % 31536000) / 2628000);
        let d = Math.floor(((seconds % 31536000) % 2628000) / 86400);
        let h = Math.floor((seconds % (3600 * 24)) / 3600);
        return ({ y, mo, d, h })
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
            const zeroYearText = " 0 years, "
            const zeroMonthText = " 0 months, "
            const zeroDayText = " 0 days, "
            const zeroHourText = " 0 hours "
            let yDisplay = y > 0 ? y + (y === 1 ? " year, " : " years, ") : zeroYearText ;
            let moDisplay = mo > 0 ? mo + (mo === 1 ? " month, " : " months, ") : zeroMonthText ;
            let dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : zeroDayText ;
            let hDisplay = h > 0 ? h + (h === 1 ? " hour" : " hours") : zeroHourText ;
            const toReturn = yDisplay + moDisplay + dDisplay + hDisplay
            const toReturnZero = zeroYearText + zeroMonthText + zeroDayText + zeroHourText
            return toReturn === toReturnZero ? ' less than an hour ' : toReturn;
        }
    }

    createTime() {
        try {
            const { year, month, day } = this.state
            let date = new Date()
            date = new Date(date.setFullYear(date.getFullYear() + parseInt(year)))
            date = new Date(date.setMonth(date.getMonth() + parseInt(month)))
            date = date.addDays(parseInt(day))
            let _gTime = date.toISOString().replaceAll('-', '').replaceAll(':', '')
            _gTime = _gTime.slice(0, _gTime.indexOf('.'))
            this.setState({
                googleCalendarDateText: `${_gTime}Z`
            })
            return date
        } catch (error) {
            if (
                (this.state.year === '' || this.state.month === '' || this.state.day === '')
                ||
                (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
                ||
                (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
            ) { } else {
                this.handleShowError('Something wrong with time')
            }
        }
    }

    async cancelWill(event) {
        try {
            const { contract } = this.state
            this.handleShowConfirm()
            await contract.removeWill(event.target.value)
                .then(async (tx) => {
                    this.handleCloseConfirm()
                    this.handleShowAwait('Revoke dWill')
                    await tx.wait()
                    this.handleCloseAwait()
                    this.handleShowEventConfirmed(`dWill has been revoked`, tx.hash)
                    setTimeout(() => {
                        window.location = '/'
                    }, 2000)
                    setTimeout(() => {
                        this.handleCloseEventConfirmed()
                    }, 5000)
                })
        } catch (error) {
            console.error(error)
            this.handleCloseConfirm()
            this.handleCloseAwait()
        }
    }

    async edit() {
        try {
            let {
                currentEditAmount,
                currentEditHeirAddress,
                currentEditTimeWhenWithdraw,
                currentEditTimeBetweenWithdrawAndStart,
                currentEditDecimals,
                currentEditID,
                year,
                month,
                day,
                baseYear,
                baseMonth,
                baseDay,
                updateHeir,
                updateAmount,
                isUnlimitedAmount,
                contract
            } = this.state
            let _updatedTime = 0;
            let promise;
            if (currentEditAmount === '') throw Error('Enter amount')
            if (year === 0 && month === 0 && day === 0) throw Error('Time when withdraw is lower then now')
            if (isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) throw Error('Enter time')
            if (currentEditHeirAddress === '') throw Error('Enter heir')
            if (year !== baseYear || month !== baseMonth || day !== baseDay) {
                let whenCreated = new Date((parseInt(currentEditTimeWhenWithdraw) - parseInt(currentEditTimeBetweenWithdrawAndStart)) * 1000)
                whenCreated = new Date(whenCreated.setFullYear(whenCreated.getFullYear() + parseInt(year)))
                whenCreated = new Date(whenCreated.setMonth(whenCreated.getMonth() + parseInt(month)))
                whenCreated = whenCreated.addDays(parseInt(day))
                _updatedTime = Math.floor(whenCreated.getTime() / 1000)
            }
            if (updateAmount === true && isUnlimitedAmount) {
                currentEditAmount = ethers.constants.MaxUint256.toString()
            }
            if (updateHeir === true && updateAmount === false && year === baseYear && month === baseMonth && day === baseDay) {
                promise = contract.updateHeir(
                    currentEditID,
                    currentEditHeirAddress
                )
            } else if (updateHeir === false && updateAmount === true && year === baseYear && month === baseMonth && day === baseDay) {
                promise = contract.updateAmount(
                    currentEditID,
                    currentEditAmount === ethers.constants.MaxUint256.toString() ? currentEditAmount : (BigInt(currentEditAmount * Math.pow(10, currentEditDecimals))).toString()
                )
            } else if (updateHeir === false && updateAmount === false && (year !== baseYear || month !== baseMonth || day !== baseDay)) {
                promise = contract.updateWithdrawalTime(
                    currentEditID,
                    _updatedTime
                )
            } else {
                promise = contract.update(
                    currentEditID,
                    _updatedTime,
                    currentEditHeirAddress,
                    currentEditAmount === ethers.constants.MaxUint256.toString() ? currentEditAmount : (BigInt(currentEditAmount * Math.pow(10, currentEditDecimals))).toString()
                )
            }
            if (updateHeir === false && updateAmount === false && year === baseYear && month === baseMonth && day === baseDay) throw Error('Nothing to update')
            this.handleShowConfirm()
            promise
                .then(async (tx) => {
                    // this.handleCloseConfirm()
                    this.handleShowAwait(`Edit dWill`)
                    await tx.wait()
                        .then(() => {
                            this.handleCloseAwait()
                            this.handleCloseEdit()
                            this.handleShowEventConfirmed(`dWill has been edited`, tx.hash)
                            setTimeout(() => {
                                this.handleCloseEventConfirmed()
                            }, 5000)
                            this.setState({
                                updateHeir: false,
                                updateAmount: false,
                                year: 0,
                                month: 0,
                                day: 0,
                            })
                        })
                })
                .catch((error) => {
                    console.error(error)
                    if (error.reason !== undefined) {
                        if (error.reason.includes('invalid address')) {
                            this.setState({
                                errortext: 'Invalid address'
                            })
                            this.handleCloseConfirm()
                            this.handleShowError()
                        }
                    }
                    if (error.message.includes('cannot estimate gas; transaction may fail or may require manual gas limit')) {
                        this.setState({
                            errortext: 'Something went wrong. Maybe you have already bequeathed all your tokens or you are trying to bequeath all tokens to one address when there is already some amount for another.'
                        })
                        this.handleShowError()
                    }
                    if (this.state.currentEditAmount === '0') {
                        this.setState({
                            errortext: 'Invalid amount'
                        })
                        this.handleCloseConfirm()
                        this.handleShowError()
                    }
                    setTimeout(() => {
                        this.handleCloseError()
                    }, 10000)
                    this.handleCloseConfirm()
                })
        } catch (error) {
            console.error(error)
            if (error.message !== undefined) {
                if (error.message.includes('Time is undefined')) {
                    this.setState({
                        errortext: '???????????????? ?????? ???????????? ???? ????????????????'
                    })
                    this.handleShowError()
                }
                if (error.message.includes('Nothing to update')) {
                    this.setState({
                        errortext: '?????? ?????????????????????? ????????????'
                    })
                    this.handleShowError()
                }
                if (error.message === `If you want to change the time, enter all the input data, otherwise do not enter the input data`) {
                    this.setState({
                        errortext: '???????? ???? ???????????? ???????????????? ??????????, ?????????????? ?????? ?????????????? ????????????, ?? ?????????????????? ???????????? ???? ?????????????? ?????????????? ????????????'
                    })
                }
                if (error.message.includes(`Time when withdraw is lower then now`)) {
                    this.setState({
                        errortext: 'Time when withdraw is too low'
                    })
                    this.handleShowError()
                }
                if (error.message.includes('Enter amount')) {
                    this.setState({
                        errortext: 'Enter amount',
                        currentEditAmount: this.state.currentEditBaseAmount
                    })
                    this.handleShowError()
                }
                if (error.message.includes('Enter time')) {
                    this.setState({
                        errortext: 'Enter time',
                        year: this.state.baseYear,
                        month: this.state.baseMonth,
                        day: this.state.baseDay
                    })
                    this.handleShowError()
                }
                if (error.message.includes('Enter heir')) {
                    this.setState({
                        errortext: 'Enter heir',
                        currentEditHeirAddress: this.state.currentEditBaseHeirAddress
                    })
                    this.handleShowError()
                }
                setTimeout(() => {
                    this.handleCloseError()
                }, 10000)
            }
            this.handleCloseConfirm()
            this.handleCloseAwait()
            this.setState({
                updateHeir: false,
                updateAmount: false,
            })
        }
    }

    async approve() {
        const { contractAddress, signer, currentEditToken, currentEditSymbol } = this.state
        const _token = new ethers.Contract(currentEditToken, ERC20.abi, signer)
        this.handleShowConfirm()
        await _token.approve(contractAddress, ethers.constants.MaxUint256)
            .then(async (tx) => {
                this.handleShowAwait(`Approve ${currentEditSymbol}`)
                await tx.wait()
                    .then(() => {
                        this.handleCloseAwait()
                        this.setState({
                            approved: true
                        })
                    })
                this.handleShowEventConfirmed(`Approved ${currentEditSymbol}`, tx.hash)
                setTimeout(() => {
                    this.handleCloseEventConfirmed()
                }, 5000)
            })
            .catch(err => {
                console.error(err)
                this.handleCloseConfirm()
                this.handleCloseAwait()
                this.handleShowError('Something went wrong')
                setTimeout(() => {
                    this.handleCloseError()
                }, 10000)
            })
    }

    onChangeYear(event) {
        this.setState({
            year: parseInt(event.target.value)
        }, () => {
            this.createTime()
        })
    }

    onChangeMonth(event) {
        this.setState({
            month: parseInt(event.target.value)
        }, () => {
            this.createTime()
        })
    }

    onChangeDay(event) {
        this.setState({
            day: parseInt(event.target.value)
        }, () => {
            this.createTime()
        })
    }

    onChangeHeirAddress(event) {
        let updateHeir = false;
        if (this.state.currentEditBaseHeirAddress !== event.target.value) {
            updateHeir = true
        }
        this.setState({
            currentEditHeirAddress: event.target.value,
            updateHeir,
            isAddress: ethers.utils.isAddress(event.target.value)
        })
    }

    async onChangeAmount(event) {
        try {
            const {
                contractAddress,
                signer,
                signerAddress,
                currentEditBaseAmount,
                currentEditToken,
                currentEditDecimals,
                contract
            } = this.state
            if (parseFloat(currentEditBaseAmount) < parseFloat(event.target.value)) {
                this.setState({
                    currentEditAmount: event.target.value,
                    updateAmount: true
                })
                const _token = new ethers.Contract(currentEditToken, ERC20.abi, signer)
                const allowance = (await _token.allowance(signerAddress, contractAddress)).toString()
                const allWillsAmountThisToken = await contract.willAmountForToken(signerAddress, _token.address)
                if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
                    this.setState({
                        approved: true
                    })
                } else {
                    this.changeApproved(
                        BigInt(allowance),
                        BigInt(
                            (parseFloat(event.target.value) - parseFloat(currentEditBaseAmount))
                            *
                            Math.pow(10, await _token.decimals())
                        ) + BigInt(allWillsAmountThisToken),
                        currentEditDecimals
                    )
                }
            }
            if (parseFloat(currentEditBaseAmount) > parseFloat(event.target.value)) {
                parseFloat(event.target.value) >= 0
                    ?
                    this.setState({
                        currentEditAmount: event.target.value,
                        approved: true,
                        updateAmount: true
                    })
                    :
                    this.setState({
                        currentEditAmount: ''
                    })
            }
            if (parseFloat(currentEditBaseAmount) === parseFloat(event.target.value)) {
                this.setState({
                    currentEditAmount: event.target.value,
                    approved: true,
                    updateAmount: false
                })
            }
            if (event.target.value === '') {
                this.setState({
                    currentEditAmount: ''
                })
            }
        } catch (error) {
            console.error(error)
        }
    }

    onChangeTime(event) {
        this.setState({
            time: event.target.value
        })
    }

    changeApproved(allowance, amount, decimals) {
        try {
            if (allowance >= amount) {
                this.setState({
                    approved: true
                })
            } else {
                this.setState({
                    approved: false
                })
            }
        } catch (error) {
            console.error(error.reason)
        }
    }

    async onSetMaxAmount() {
        const { signer, signerAddress, currentEditToken, contract, contractAddress } = this.state
        const _token = new ethers.Contract(currentEditToken, ERC20.abi, signer)
        const allowance = (await _token.allowance(signerAddress, contractAddress)).toString()
        const allWillsAmountThisToken = await contract.willAmountForToken(signerAddress, _token.address)
        await _token.balanceOf(signerAddress)
            .then(async (balance) => {
                this.setState({
                    currentEditAmount: Math.floor((balance / Math.pow(10, await _token.decimals()))).toString()
                }, () => {
                    if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
                        this.setState({
                            approved: true
                        })
                    } else {
                        this.changeApproved(BigInt(allowance), BigInt(allWillsAmountThisToken) + BigInt(balance))
                    }
                })
            })
    }

    onSetMaxAmount = this.onSetMaxAmount.bind(this)

    approve = this.approve.bind(this)
    changeApproved = this.changeApproved.bind(this)
    onChangeAmount = this.onChangeAmount.bind(this)
    onChangeTime = this.onChangeTime.bind(this)
    cancelWill = this.cancelWill.bind(this)
    edit = this.edit.bind(this)
    onChangeYear = this.onChangeYear.bind(this)
    onChangeMonth = this.onChangeMonth.bind(this)
    onChangeDay = this.onChangeDay.bind(this)
    onChangeHeirAddress = this.onChangeHeirAddress.bind(this)

    handleCloseEdit = () => this.setState({
        showEdit: false, currentEditID: '',
        currentEditHeirAddress: '', currentEditTimeWhenWithdraw: '',
        notificationsOn: false
    });
    handleShowEdit = async (params) => {
        try {
            const data = JSON.parse(params)
            let base = this.timeBetweenWithdrawAndStartConverterNumbers(data.timeBetweenWithdrawAndStart)
            const { year, month, day, base_y, base_mo, base_d, base_h } = createRightEditTime(base)
            this.setState({
                showEdit: true,
                currentEditID: data.ID,
                currentEditHeirAddress: data.heir,
                currentEditBaseHeirAddress: data.heir,
                currentEditTimeWhenWithdraw: data.timeWhenWithdraw,
                currentEditTimeBetweenWithdrawAndStart: data.timeBetweenWithdrawAndStart,
                currentEditToken: data.token,
                currentEditSymbol: data.symbol,
                limitedText: data.amount === ethers.constants.MaxUint256.toString() ? 'unlimited' : 'limited by',
                isUnlimitedAmount: data.amount === ethers.constants.MaxUint256.toString(),
                isUnlimitedAmountBase: data.amount === ethers.constants.MaxUint256.toString(),
                currentEditAmount: data.amount === ethers.constants.MaxUint256.toString() ? ethers.constants.MaxUint256.toString() : data.amount / Math.pow(10, data.decimals),
                currentEditBaseAmount: data.amount === ethers.constants.MaxUint256.toString() ? ethers.constants.MaxUint256.toString() : data.amount / Math.pow(10, data.decimals),
                currentEditDecimals: data.decimals,
                baseYear: base_y,
                baseMonth: base_mo,
                baseDay: base_d,
                baseHour: base_h,
                year: year,
                month: month,
                day,
            }, () => {
                this.createTime()
            })
        } catch (error) {
            console.error(error)
        }
    };

    checkIfNotChanged(checkApprove) {
        const notChanged = 
        (this.state.approved === checkApprove)
        ||
        (this.state.currentEditAmount === '0')
        ||
        (this.state.currentEditAmount === '')
        ||
        (this.state.isAddress === false)
        ||
        (this.state.currentEditHeirAddress === '')
        ||
        (this.state.year === '' || this.state.month === '' || this.state.day === '')
        ||
        (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
        ||
        (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
        ||
        (
            this.state.currentEditAmount.toString() === this.state.currentEditBaseAmount.toString()
            &&
            this.state.currentEditHeirAddress.toString() === this.state.currentEditBaseHeirAddress.toString()
            &&
            this.state.year.toString() === this.state.baseYear.toString()
            &&
            this.state.month.toString() === this.state.baseMonth.toString()
            &&
            this.state.day.toString() === this.state.baseDay.toString()
        )
        return notChanged
    }

    checkIfNotChanged = this.checkIfNotChanged.bind(this)

    changeNotifications() {
        this.setState({
            notificationsOn: this.state.notificationsOn === true ? false : true
        })
    }

    changeDelivery() {
        this.createTime()
        this.setState({
            deliveryOn: this.state.deliveryOn === true ? false : true
        })
    }

    changeMessage() {
        this.createTime()
        this.setState({
            messageOn: this.state.messageOn === true ? false : true
        })
    }

    async onChangeUnlimitedAmount() {
        try {
            let { contractAddress, signer, signerAddress, currentEditToken, isUnlimitedAmount, isUnlimitedAmountBase, contract } = this.state
            //max amount uint256
            isUnlimitedAmount = isUnlimitedAmount === true ? false : true
            this.setState({
                currentEditAmount: isUnlimitedAmount === true ? ethers.constants.MaxUint256.toString() : '',
                isUnlimitedAmount,
                updateAmount: isUnlimitedAmount !== isUnlimitedAmountBase,
                limitedText: isUnlimitedAmount === true ? 'unlimited' : 'limited by'
            }, async () => {
                console.log(this.state.currentEditAmount, this.state.currentEditBaseAmount)
                const _token = new ethers.Contract(currentEditToken, ERC20.abi, signer)
                const allowance = await _token.allowance(signerAddress, contractAddress)
                const allWillsAmountThisToken = await contract.willAmountForToken(signerAddress, _token.address)
                if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
                    this.setState({
                        approved: true
                    })
                } else {
                    this.changeApproved(BigInt(allowance), BigInt(allWillsAmountThisToken) + BigInt(this.state.currentEditAmount))
                }
            })
        } catch (error) {
            console.error(error)
            if (error.message.includes('resolver or addr is not configured')) {
                this.setState({
                    errortext: '???????????????? ??????????',
                    amount: '0',
                    isUnlimitedAmount: false
                })
                this.handleShowError()
            }
        }
    }

    changeNotifications = this.changeNotifications.bind(this)
    changeDelivery = this.changeDelivery.bind(this)
    changeMessage = this.changeMessage.bind(this)
    onChangeUnlimitedAmount = this.onChangeUnlimitedAmount.bind(this)

    handleCloseEdit = this.handleCloseEdit.bind(this)
    handleShowEdit = this.handleShowEdit.bind(this)

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

    timeConverter = this.timeConverter.bind(this)
    remainingTime = this.remainingTime.bind(this)

    handleShowError = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showError: true })
    }
    handleCloseError = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.remove('small-modal')
        this.setState({ showError: false })
    }

    handleShowError = this.handleShowError.bind(this)
    handleCloseError = this.handleCloseError.bind(this)

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

    render() {
        return (
            // <div id='wills'>
            <div className='wills_list-my-wills wills-description-block'>
                <div className="your_inheritances_ul-text__head">
                    <h3 className='wills_list_h3'>Your dWills</h3>
                    <div className="your-wills__info-message" data-title={tooltipText.wills}>
                        <img src={infoBtn} alt="Info"></img>
                    </div>
                </div>
                {
                    this.state.wills.length > 0
                        ?
                        <div id='wills-list_ul-btn'>
                            {
                                this.state.wills.map((v) => {
                                    return (
                                        <div key={v.ID} className="your-wills">
                                            <div className='your-wills_text'>

                                                {/* <span>id: {v.ID.toString()} </span> */}
                                                <div className="page-data__block-container">
                                                    <span className="wills-description-block__id">dWill #{v.ID.toString()} </span>
                                                    <div className='your-wills_text-info'>
                                                        <span>
                                                            You bequeathed {v.amount.toString() === ethers.constants.MaxUint256.toString() ? <span className='your-wills_remain'>all</span> : <span className='your-wills_remain'>{(v.amount / Math.pow(10, v.decimals)).toString()}</span>} your <span className='your-wills_remain'>{v.symbol}</span> from <span className='your-wills_remain'>{this.props.networkName}</span> chain to wallet
                                                        </span>
                                                        <a href={`${this.props.networkProvider}/address/${v.heir}`} target="_blank" rel="noreferrer">
                                                            {` ${v.heir}`}
                                                        </a>
                                                        <span className="your-wills_text-info__footer">
                                                            {
                                                                this.remainingTime(v.timeWhenWithdraw.toString()) === 'Nothing.'
                                                                ?
                                                                <p>
                                                                    Inheritance can be harvest.
                                                                </p>
                                                                :
                                                                <div>
                                                                    <p>
                                                                        Inheritance can be harvest if the period of inactivity is longer than
                                                                    </p>
                                                                    <span className='your-wills_date'>{this.timeBetweenWithdrawAndStartConverter(v.timeBetweenWithdrawAndStart)}</span>
                                                                    <span className='your-wills_remain'>{`(remain: ${this.remainingTime(v.timeWhenWithdraw.toString())})`}</span>
                                                                </div>
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="your-wills__btns">
                                                        <button className="btn_btns btn-default"
                                                            onClick={
                                                                this.state.showEdit === false
                                                                    ?
                                                                    () => this.handleShowEdit(
                                                                        JSON.stringify({
                                                                            ID: v.ID.toString(),
                                                                            timeWhenWithdraw: v.timeWhenWithdraw.toString(),
                                                                            timeBetweenWithdrawAndStart: v.timeBetweenWithdrawAndStart.toString(),
                                                                            heir: v.heir,
                                                                            token: v.token,
                                                                            symbol: v.symbol,
                                                                            amount: v.amount.toString(),
                                                                            decimals: v.decimals
                                                                        })
                                                                    )
                                                                    : this.handleCloseEdit}>
                                                            <img src={editPic} alt="Edit"/>
                                                            Edit
                                                        </button>
                                                        <button type="button" className="btn_green_revoke btn-default" id='revoke' value={v.ID.toString()} onClick={this.cancelWill}>
                                                            <img src={revokePic} alt="Revoke"/>
                                                            Revoke</button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        :
                        <h4>You don't have active dWills yet.</h4>
                }
                <Modal className="will-block" show={this.state.showEdit} style={{ height: "" }}>
                    <div className="will-block__wrapper">
                        <Modal.Header>
                            <Modal.Title>Edit dWill</Modal.Title>
                            <hr />
                        </Modal.Header>
                        <Modal.Body>
                            <div className="modal-body__row">
                                <div className="your-wills__header">
                                    <div>
                                    I bequeath my
                                    </div>
                                    <div className="your-wills__current-token">{this.state.currentEditSymbol}</div>
                                    <div className="your-wills__check-token">
                                        <span>in the amount</span>
                                        <div className="your-wills__checkbox">
                                            <input id="unlimited" type="checkbox" onChange={this.onChangeUnlimitedAmount} checked={this.state.isUnlimitedAmount} className="form-check-input mt-0" />
                                            <label htmlFor="unlimited">{this.state.limitedText}</label><br />
                                        </div>
                                        <div style={{ display: this.state.isUnlimitedAmount === false ? 'block' : 'none' }} className="your-wills__max mt-0">
                                            <input onChange={this.onChangeAmount} value={this.state.currentEditAmount}
                                                type="number" min="0" className="input-group mb-3" placeholder="Enter the amount" />
                                            <Button variant="outline-success" onClick={this.onSetMaxAmount}>
                                                All
                                            </Button>
                                        </div>
                                        <div className="your-wills__info-message" data-title={tooltipText.tokens}>
                                            <img src={infoBtn} alt="Info"></img>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="modal-body__row modal-body__row-direction">From the wallet <a href={`${this.props.networkProvider}/address/${this.state.signerAddress}`} target="_blank" rel="noreferrer">{
                                this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)
                            }</a>on the <i className="br"></i>{this.props.networkName} network<img src={this.state.networkPic} alt="networkpic" />
                                <div className="your-wills__info-message" data-title={tooltipText.network}>
                                    <img src={infoBtn} alt="Info"></img>
                                </div></div>
                            <div className="your-wills__wallet modal-body__row">
                                <div className="your-wills__wallet-row">
                                    To trusted wallet
                                    <div className="your-wills__info-message" data-title={tooltipText.wallet}>
                                        <img src={infoBtn} alt="Info"></img>
                                    </div>
                                </div>
                                <input onChange={this.onChangeHeirAddress} value={this.state.currentEditHeirAddress} className="input-group mb-3" placeholder={ethers.constants.AddressZero}/>
                                <p style={{ display: this.state.isAddress ? 'none' : 'block' }}>Incorrect wallet address format</p>
                            </div>
                            <div className="modal-body__row">
                                <div className="will-date__text">
                                Provided that I will be inactive, starting from the moment of dWill creation ({
                                        this.timeConverter((parseInt(this.state.currentEditTimeWhenWithdraw) - parseInt(this.state.currentEditTimeBetweenWithdrawAndStart)).toString())
                                    }) more than:
                                    <div className="your-wills__info-message" data-title={tooltipText.time}>
                                        <img src={infoBtn} alt="Info"></img>
                                    </div>
                                </div>
                                <div className="will-date">
                                    <div className="will-date__row">
                                        <input type="number" onChange={this.onChangeYear} value={this.state.year} className="input-group input-group-year" />
                                        <label >Years</label><br />
                                    </div>
                                    <div className="will-date__row">
                                        <input type="number" onChange={this.onChangeMonth} value={this.state.month} className="input-group input-group-month" />
                                        <label >Months</label><br />
                                    </div>
                                    <div className="will-date__row">
                                        <input type="number" onChange={this.onChangeDay} value={this.state.day} className="input-group input-group-days" />
                                        <label >Days</label><br />
                                    </div>
                                    <div className="your-wills__info-message" data-title={tooltipText.tokens}>
                                        <img src={infoBtn} alt="Info"></img>
                                    </div>
                                </div>
                            </div>
                            <div className="your-wills__settings">
                                <div className="will-date__row will-date__row--checkbox">
                                    <div className="will-date__row-input">
                                        <input id="wills-set1" type="checkbox" onChange={this.changeMessage} disabled={true} className="form-check form-check-input mt-0" />
                                        <label htmlFor="wills-set1">Add NFT Message (coming soon)</label><br />
                                    </div>
                                    <div className="your-wills__info-message" data-title={tooltipText.NFTMessage}>
                                        <img src={infoBtn} alt="Info"></img>
                                    </div>
                                </div>
                                <div className="your-wills__notifications" style={this.state.messageOn === true ? { display: 'block' } : { display: 'none' }}>
                                    <span>The message is stored encrypted and can only be read by the recipient when the will is received.</span>
                                    <textarea placeholder="NFT message"></textarea>
                                </div>
                                <div className="will-date__row will-date__row--checkbox">
                                    <div className="will-date__row-input">
                                        <input id="wills-set2" type="checkbox" onChange={this.changeDelivery} disabled={true} className="form-check form-check-input mt-0" />
                                        <label htmlFor="wills-set2">Automatic token delivery (coming soon)</label><br />
                                    </div>
                                    <div className="your-wills__info-message" data-title={tooltipText.NFTMessage}>
                                        <img src={infoBtn} alt="Info"></img>
                                    </div>
                                </div>
                                <div className="your-wills__notifications" style={this.state.deliveryOn === true ? { display: 'block' } : { display: 'none' }}>
                                    <span>Once the condition is met, the bequeathed tokens will be automatically sent to the trusted wallet (10 USDT).</span>
                                </div>
                                <div className="will-date__row will-date__row--checkbox">
                                    <div className="will-date__row-input">
                                        <input id="wills-set3" type="checkbox" onChange={this.changeNotifications} disabled={false} className="form-check form-check-input mt-0" />
                                        <label htmlFor="wills-set3">Notifications</label><br />
                                    </div>
                                    <div className="your-wills__info-message" data-title={tooltipText.notifications}>
                                        <img src={infoBtn} alt="Info"></img>
                                    </div>
                                </div>
                                <div className="your-wills__notifications" style={this.state.notificationsOn === true ? { display: 'block' } : { display: 'none' }}>
                                    <span>Set up alerts in Telegram, Email or Google Calendar and dWill will notify you of all important events
                                            related to your dWills and dWills intended for you.</span>
                                    <a href="https://t.me/thewill_bot" rel="noreferrer" className="your-wills__links" target="_blank">
                                        <img src={btnTelegram} alt="Telegram"></img>
                                        <img src={btnEmail} alt="Email"></img>
                                        <span>Setting up notifications in Telegram and email</span>
                                    </a>
                                    <div className="your-wills__links">
                                        <a href={`http://www.google.com/calendar/event?action=TEMPLATE&text=${'dWill notification. dWill time expired.'}&dates=${this.state.googleCalendarDateText}/${this.state.googleCalendarDateText}&details=${`<div><b>?????? dWill notification:</b></div><br/><div>The time to unlock the dWill has expired.</div><br/<div>Heir: <a href="${this.props.networkProvider + '/address/' + this.state.heirAddress}">${this.state.heirAddressShort}</a></div><br/><br/><div>You can see more info on our website.</div><br/><a href="https://dwill.app"><b>dWill.app</b></a>`}&trp=false&sprop=&sprop=name:`} target="_blank" rel="noreferrer"><img src={btnCalendar}></img>???????????????? ?????????????? ?? Google Calendar</a>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <div>
                                <ul className="your-wills__footer">
                                    <li>
                                        <Button variant="primary" disabled={
                                            this.checkIfNotChanged(true)
                                        } onClick={this.state.approved === false ? this.approve : null} style={
                                            {
                                                "background":
                                                        this.checkIfNotChanged(true)
                                                        ? '#3E474F' : '#5ED5A8'
                                            }
                                        } >
                                            Approve
                                        </Button>
                                        <div className="your-wills__info-message" data-title={tooltipText.approve}>
                                            <img src={infoBtn} alt="Info"></img>
                                        </div>
                                    </li>
                                    <li>
                                        <Button variant="primary" disabled={
                                            this.checkIfNotChanged(false)
                                        } onClick={this.state.approved === true ? this.edit : null} style={
                                            {
                                                "background":
                                                        this.checkIfNotChanged(false)
                                                        ? '#3E474F' : '#5ED5A8'
                                            }
                                        } >
                                            Edit
                                        </Button>
                                    </li>
                                </ul>
                                <Button className="btn-close-modal" onClick={this.handleCloseEdit}>
                                    <img src={closePic} alt="Close"/>
                                </Button>
                            </div>
                        </Modal.Footer>
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
                            <img src={linkBtn} alt="Provider"></img>
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
                        <Button variant="danger" onClick={this.handleCloseError} className="btn btn-danger">
                            <img src={closePic} alt="Close"/>
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Wills;
