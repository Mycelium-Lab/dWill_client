
import { ethers } from "ethers";
import { Component } from 'react';
import axios from 'axios';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Provider } from 'ethcall';
import './App.css';
import PolygonPic from './content/poligon.svg'
import BinancePic from './content/binance.svg'
import EthereumPic from './content/ethereum.svg'
import AvalanchePic from './content/avalanche.svg'
import OptimismPic from './content/optimism.svg'
import ArbitrumPic from './content/arbitrum.svg'
import discordLogo from './content/DiscordLogo.svg'
import twitterLogo from './content/TwitterLogo.svg'
import telegramLogo from './content/TelegramLogo.svg'
import documentLogo from './content/document.svg'
import logo from './content/logo2-2.svg'
import Connect from './Utils/Connect';
import TheWill from './Contract/TheWill.json'
import { chainIDs, chainRPCURL, NetworkProviders, TheWillAddresses, TokenAddresses } from './Utils/Constants';
import Data from './Data/Data';
import Main from './Main/Main';

import { renderStars } from "./Utils/stars";

class App extends Component {

  state = {
    signer: null,
    ethcallProvider: null,
    provider: null,
    signerAddress: null,
    contract: null,
    contractAddress: '',
    tokenAddress: '',
    network: null,
    networkProvider: '',
    networkName: null,
    networkPic: null,
    total: '',
    showConfirm: false,
    showAwait: false,
    willsLength: 0,
    inheritancesLength: 0
  };

  componentDidMount = async () => {
    try {
      const localStorageAccount = localStorage.getItem('account')
      const walletType = localStorage.getItem('wallet')
      const walletconnect = localStorage.getItem('walletconnect')
      if (localStorageAccount !== null && (walletType !== null || walletconnect !== null)) {
        if (walletType === 'Metamask') {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const accounts = await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner()
          window.ethereum.on('accountsChanged', async (_accounts) => {
            if (_accounts.length === 0) {
              localStorage.removeItem('account')
              localStorage.removeItem('wallet')
              this.setState({
                provider: null,
                signer: null,
                signerAddress: null
              })
            } else {
              localStorage.setItem('account', _accounts[0])
              await provider.send("eth_requestAccounts", []);
              const _signer = provider.getSigner()
              this.setState({
                signer: _signer,
                signerAddress: _accounts[0]
              })
            }
           // window.location.reload()
          })
          window.ethereum.on('chainChanged', () => {
            //window.location.reload()
          })
          localStorage.setItem('account', accounts[0]);
          localStorage.setItem('wallet', 'Metamask');
          this.setProperties(provider, signer, accounts[0])
        }
        if (walletType === 'WalletConnect' || walletconnect !== null) {
          const provider = new WalletConnectProvider({
            rpc: {
              80001: chainRPCURL.Mumbai,
              97: chainRPCURL.BinanceTestnet,
              5: chainRPCURL.Goerli,
              137: chainRPCURL.Polygon,
              56: chainRPCURL.BinanceMainnet,
              1: chainRPCURL.EthereumMainnet,
              42161: chainRPCURL.ArbitrumMainnet,
              43114: chainRPCURL.AvalancheMainnet,
              10: chainRPCURL.OptimismMainnet
            }
          })
          await provider.enable().catch(err=>console.log(err));
          const _provider = new ethers.providers.Web3Provider(provider)
          provider.on('accountsChanged', async (__accounts) => {
            if (__accounts.length === 0) {
              localStorage.removeItem('account')
              localStorage.removeItem('wallet')
              localStorage.removeItem('walletconnect')
              this.setState({
                provider: null,
                signer: null,
                signerAddress: null
              })
            } else {
              localStorage.setItem('account', __accounts[0])
              const _signer = _provider.getSigner()
              this.setState({
                signer: _signer,
                signerAddress: __accounts[0]
              })
            }
            //window.location.reload()
          })
          provider.on('disconnect', () => {
            localStorage.removeItem('account')
            localStorage.removeItem('wallet')
            localStorage.removeItem('walletconnect')
            this.setState({
              provider: null,
              signer: null,
              signerAddress: null
            })
          })
          provider.on('chainChanged', () => {
           // window.location.reload()
          })
          const _signer = _provider.getSigner()
          const _address = await _signer.getAddress()
          localStorage.setItem('account', _address);
          localStorage.setItem('wallet', 'WalletConnect');
          this.setProperties(_provider, _signer, _address)
        }
      }
      axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
        .then(response => {
          this.setState({
            total: this.numberWithSpaces(response.data)
          })
        })
      setInterval(() => {
        axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
          .then(response => {
            this.setState({
              total: this.numberWithSpaces(response.data)
            })
          })
      }, 5000)

    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    }

    renderStars()
  };

  numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  async setProperties(provider, signer, signerAddress) {
    try {
      const network = (await provider.getNetwork()).chainId
      let contractAddress;
      let tokenAddress;
      let networkProvider;
      let networkPicture;
      let networkName;
      if (network === chainIDs.Mumbai) {
        contractAddress = TheWillAddresses.Mumbai
        tokenAddress = TokenAddresses.Mumbai
        networkProvider = NetworkProviders.Mumbai
        networkPicture = PolygonPic
        networkName = 'Mumbai'
      } else if (network === chainIDs.Goerli) {
        contractAddress = TheWillAddresses.Goerli
        tokenAddress = TokenAddresses.Goerli
        networkProvider = NetworkProviders.Goerli
        networkPicture = EthereumPic
        networkName = 'Goerli'
      } else if (network === chainIDs.Polygon) {
        contractAddress = TheWillAddresses.Polygon
        networkProvider = NetworkProviders.Polygon
        networkPicture = PolygonPic
        networkName = 'Polygon'
      } else if (network === chainIDs.BinanceTestnet) {
        contractAddress = TheWillAddresses.BinanceTestnet
        tokenAddress = TokenAddresses.BinanceTestnet
        networkProvider = NetworkProviders.BinanceTestnet
        networkPicture = BinancePic
        networkName = 'BNB Test'
      } else if (network === chainIDs.BinanceMainnet) {
        contractAddress = TheWillAddresses.BinanceMainnet
        networkProvider = NetworkProviders.BinanceMainnet
        networkPicture = BinancePic
        networkName = 'BNB'
      } else if (network === chainIDs.EthereumMainnet) {
        contractAddress = TheWillAddresses.EthereumMainnet
        networkProvider = NetworkProviders.EthereumMainnet
        networkPicture = EthereumPic
        networkName = 'Ethereum'
      } else if (network === chainIDs.AvalancheMainnet) {
        contractAddress = TheWillAddresses.AvalancheMainnet
        networkProvider = NetworkProviders.AvalancheMainnet
        networkPicture = AvalanchePic
        networkName = 'Avalance'
      } else if (network === chainIDs.OptimismMainnet) {
        contractAddress = TheWillAddresses.OptimismMainnet
        networkProvider = NetworkProviders.OptimismMainnet
        networkPicture = OptimismPic
        networkName = 'Optimism'
      } else if (network === chainIDs.ArbitrumMainnet) {
        contractAddress = TheWillAddresses.ArbitrumMainnet
        networkProvider = NetworkProviders.ArbitrumMainnet
        networkPicture = ArbitrumPic
        networkName = 'Arbitrum'
      }
      const ethcallProvider = new Provider()
      await ethcallProvider.init(provider)
      this.setState({
        ethcallProvider,
        provider,
        signer,
        signerAddress,
        network,
        contractAddress,
        tokenAddress,
        networkProvider,
        networkPic: networkPicture,
        networkName
      }, async () => {
        await this.loadBasic()
      })
    } catch (error) {
      if (provider === null && signer === null && signerAddress === null) {
        this.setState({
          provider,
          signer,
          signerAddress
        })
      }
      console.error(error)
    }
  }

  setProperties = this.setProperties.bind(this)

  async loadBasic() {
    try {
      const { signer, signerAddress, contractAddress } = this.state
      const contract = new ethers.Contract(contractAddress, TheWill.abi, signer)
      const wills = await contract.getWillsLength(signerAddress)
      const inheritances = await contract.getInheritancesLength(signerAddress)
      contract.on('AddWill', async (ID, owner, heir, token, withdrawalTime, amount) => {
        if (owner.toLowerCase() === signerAddress.toLowerCase()) {
          this.setState({
            willsLength: this.state.willsLength + 1
          })
        }
        setTimeout(async () => {
          axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
            .then(response => {
              this.setState({
                total: this.numberWithSpaces(response.data)
              })
            })
        }, 5000)
      })
      this.setState({
        contract, 
        willsLength: wills, 
        inheritancesLength: inheritances
      })
    } catch (error) {
      console.error(error)
    }
  }

  loadBasic = this.loadBasic.bind(this)

  render() {
    return (
      <div className="App">
        <canvas id="space"></canvas>
        <header className="header _container">
          <div className='header_boxes'>
            <div className="header_boxes-col">
              <div>
                <img src={logo} alt="LOGO"/>
              </div>
              <div className="amount-will">
                <div>
                  Total bequeathed:
                </div>
                <div>
                  {this.state.total} USD
                </div>
              </div>
            </div>

            {
              <Connect
                setProperties={this.setProperties}
                network={this.state.network}
                networkName={this.state.networkName}
                networkPic={this.state.networkPic}
              />
            }

          </div>
        </header>

        <main className="_container">
          {
            this.state.signer === null || this.state.willsLength == 0
              ?
              <Main
                inheritancesLength={this.state.inheritancesLength}
                willsLength={this.state.willsLength}
                provider={this.state.provider}
                signer={this.state.signer}
                signerAddress={this.state.signerAddress}
                network={this.state.network}
                setProperties={this.setProperties}
                tokenAddress={this.state.tokenAddress}
                contractAddress={this.state.contractAddress}
                networkProvider={this.state.networkProvider}
                networkName={this.state.networkName}
              />
              :
              <Data
                provider={this.state.provider}
                ethcallProvider={this.state.ethcallProvider}
                signer={this.state.signer}
                signerAddress={this.state.signerAddress}
                network={this.state.network}
                tokenAddress={this.state.tokenAddress}
                contractAddress={this.state.contractAddress}
                networkProvider={this.state.networkProvider}
                networkName={this.state.networkName}
                willsLength={this.state.willsLength}
              />
          }
        </main>
        <footer className="footer">
          <div className="footer__wrapper _container">
            <div className="footer__social">
              <a href="https://dwill.slite.page/p/yFyU0Vhz-TJakC/dWIll" target="_blank" rel="noreferrer" className="footer__social-document">
                <img src={documentLogo} alt="Docs"></img>
              </a>
              <a href="https://discord.gg/Sa5yvPhS9S" target="_blank" rel="noreferrer">
                <img src={discordLogo} alt="Discord"></img>
              </a>
              <a href="https://twitter.com/dWillApp" target="_blank" rel="noreferrer"> 
                <img src={twitterLogo} alt="Twitter"></img>
              </a>
              <a href="https://t.me/+FYNh4fJq5UJjZDY0" target="_blank" rel="noreferrer">
                <img src={telegramLogo} alt="Telegram"></img>
              </a>

            </div>
            <a href="mailto:support@dwill.app" target="_blank" rel="noreferrer" className="footer__copy">
              support@dwill.app
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
