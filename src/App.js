
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
import { EthereumProvider } from "@walletconnect/ethereum-provider";

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

const iOS = () => {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}

const handleWalletConnectDeepLink = () => {
  const deepLink = window.localStorage.getItem(
    'WALLETCONNECT_DEEPLINK_CHOICE'
  )
  if (deepLink) {
    try {
      const _deepLink= JSON.parse(deepLink)
      if (_deepLink.href === 'https://link.trustwallet.com/wc') {
        window.localStorage.setItem(
          'WALLETCONNECT_DEEPLINK_CHOICE',
          JSON.stringify({ name: 'Trust Wallet', href: 'trust://' })
        )
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err) {
      console.log('TrustWallet force redirect err', err)
    }
  }
}

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

  componentDidCatch = (error, errorInfo) => {
    console.log(error, errorInfo)
  }

  componentDidMount = async () => {
    try {
      document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === 'hidden' && iOS()) {
          handleWalletConnectDeepLink()
        }
      });
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
            window.location.reload()
          })
          window.ethereum.on('chainChanged', () => {
            window.location.reload()
          })
          localStorage.setItem('account', accounts[0]);
          localStorage.setItem('wallet', 'Metamask');
          this.setProperties(provider, signer, accounts[0])
        }
        if (walletType === 'WalletConnect' || walletconnect !== null) {
          const provider = await EthereumProvider.init({
            projectId: '8712657075b467bcabe8428c360ddb0c',
            chains: [chainIDs.EthereumMainnet],
            optionalChains: [chainIDs.Polygon, chainIDs.ArbitrumMainnet, chainIDs.AvalancheMainnet, chainIDs.BinanceMainnet, chainIDs.OptimismMainnet],
            showQrModal: true,
            methods: [
              "personal_sign",
              "eth_sendTransaction",
              "eth_accounts",
              "eth_requestAccounts",
              "eth_call",
              "eth_getBalance",
              "eth_sendRawTransaction",
              "eth_sign",
              "eth_signTransaction",
              "eth_signTypedData",
              "eth_signTypedData_v3",
              "eth_signTypedData_v4",
              "wallet_getPermissions",
              "wallet_requestPermissions",
              "wallet_registerOnboarding",
              "wallet_watchAsset",
              "wallet_scanQRCode"
            ],
            optionalMethods: [
              "wallet_switchEthereumChain",
              "wallet_addEthereumChain"
            ],
            events: [
                'accountsChanged',
                'chainChanged',
                'message',
                'connect',
                'disconnect'
            ]
          })
          await provider.enable();
          handleWalletConnectDeepLink()
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
            window.location.reload()
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
            window.location.reload()
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
              {/* <a href="https://discord.gg/Sa5yvPhS9S" target="_blank" rel="noreferrer">
                <img src={discordLogo} alt="Discord"></img>
              </a> */}
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
