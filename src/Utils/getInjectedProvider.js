export const getInjectedProvider = () => {
    if (typeof window === 'undefined') {
        return null
    }
    const { ethereum } = window
    if (!ethereum) {
        return null
    }
    if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
        const metamaskProvider = ethereum.providers.find((provider) => provider && provider.isMetaMask)
        if (metamaskProvider) {
            return metamaskProvider
        }
        return ethereum.providers[0]
    }
    return ethereum
}
