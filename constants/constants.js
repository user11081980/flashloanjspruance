const AMOUNTS = {
    AMOUNT_TO_FUND: "100",
    AMOUNT_TO_BORROW: "1000",
    NUMBER_OF_DECIMALS: 18
};

const ADDRESSES = {
    WHALE_WBNB: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    LINK: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    POOL_ADDRESSES_PROVIDER: "0xff75B6da14FfbbfD355Daf7a2731456b3562Ba6D",
    FLASH_LOAN_ARBITRAGE: "0xb5c3135E5F9fBE4Ef2EC8322624FBE84f524E5f3"
};

const KEYS = {
    BNB_CHAIN_ID: 56,
    ONE_INCH: "DqVxYieMBUKZmsAVioaTmdC6nAlUF4BO"
};

const URLS = {
    NEW_6HOURS_100TRANSACTIONS_100000LIQUIDITY: "https://dexscreener.com/bsc/pancakeswap?rankBy=trendingScoreH6&order=desc&minLiq=100000&maxAge=6&min6HTxns=100",
    NEW_24HOURS_100TRANSACTIONS_100000LIQUIDITY: "https://dexscreener.com/bsc/pancakeswap?rankBy=trendingScoreH6&order=desc&minLiq=100000&maxAge=24&min6HTxns=100",
    TRENDING_6HOURS_1000000LIQUIDITY: "https://dexscreener.com/bsc?rankBy=trendingScoreH6&order=desc&minLiq=1000000&profile=0",
    GAINERS_5MINUTES_25000LIQUIDITY: "https://dexscreener.com/bsc?rankBy=priceChangeM5&order=desc&minLiq=25000&min24HTxns=50&min24HVol=10000",
    POPULAR_1000000LIQUIDITY: "https://dexscreener.com/bsc?rankBy=trendingScoreH6&order=desc&minLiq=1000000&min24HVol=5000000",
    HIGHVOLUME: "https://dexscreener.com/bsc?rankBy=trendingScoreH6&order=desc&minLiq=1000000&minAge=48&min24HVol=5000000" // 1 to 5 ratio volume/liquidity
};

module.exports = {
    AMOUNTS,
    ADDRESSES,
    KEYS,
    URLS
};
