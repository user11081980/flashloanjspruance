const AMOUNTS = {
    AMOUNT_TO_FUND: "100",
    AMOUNT_TO_BORROW: "100",
    NUMBER_OF_DECIMALS: 6,
    DELAY_BETWEEN_CALLS: 2000,
    DELAY_AFTER_RATE_LIMIT_REACHED: 180 * 60 * 1000
};

const ADDRESSES = {
    WHALE_WBNB: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    LINK: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    POOL_ADDRESSES_PROVIDER: "0xff75B6da14FfbbfD355Daf7a2731456b3562Ba6D",
    FLASH_LOAN_ARBITRAGE: "0xc6C5EECF9feE2B6fd7140c6E9320c6d38F7d8eAF",
    ARBITRUM: {
        WETH: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // This is actually USDC
        POOL_ADDRESSES_PROVIDER: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
        FLASH_LOAN_ARBITRAGE: "0x4d26BF927f8A23f0f25cCF5Cabe0DEC4889DaaC5"
    }
};

const KEYS = {
    BNB_CHAIN_ID: 56,
    ARBITRUM_ID: 42161,
    ONE_INCH: "DqVxYieMBUKZmsAVioaTmdC6nAlUF4BO"
};

const URLS = {
    DEXSCREENER: [
        NEW_6HOURS_100TRANSACTIONS_100000LIQUIDITY = "https://dexscreener.com/bsc?rankBy=trendingScoreH6&order=desc&minLiq=100000&maxAge=6&min6HTxns=100",
        NEW_24HOURS_100TRANSACTIONS_100000LIQUIDITY = "https://dexscreener.com/bsc?rankBy=trendingScoreH6&order=desc&minLiq=100000&maxAge=24&min6HTxns=100",
        TRENDING_6HOURS_1000000LIQUIDITY = "https://dexscreener.com/bsc?rankBy=trendingScoreH6&order=desc&minLiq=1000000&profile=0",
        GAINERS_5MINUTES_25000LIQUIDITY = "https://dexscreener.com/bsc?rankBy=priceChangeM5&order=desc&minLiq=25000&min24HTxns=50&min24HVol=10000",
        POPULAR_1000000LIQUIDITY = "https://dexscreener.com/bsc?rankBy=trendingScoreH6&order=desc&minLiq=1000000&min24HVol=5000000", // 1 to 5 ratio volume/liquidity
        DEFAULT = "https://dexscreener.com/bsc"
    ],
    ARBITRUM:
    {
        DEXSCREENER: [
            NEW_6HOURS_100TRANSACTIONS_100000LIQUIDITY = "https://dexscreener.com/arbitrum?rankBy=trendingScoreH6&order=desc&minLiq=100000&maxAge=6&min6HTxns=100",
            NEW_24HOURS_100TRANSACTIONS_100000LIQUIDITY = "https://dexscreener.com/arbitrum?rankBy=trendingScoreH6&order=desc&minLiq=100000&maxAge=24&min6HTxns=100",
            TRENDING_6HOURS_1000000LIQUIDITY = "https://dexscreener.com/arbitrum?rankBy=trendingScoreH6&order=desc&minLiq=1000000&profile=0",
            GAINERS_5MINUTES_25000LIQUIDITY = "https://dexscreener.com/arbitrum?rankBy=priceChangeM5&order=desc&minLiq=25000&min24HTxns=50&min24HVol=10000",
            POPULAR_1000000LIQUIDITY = "https://dexscreener.com/arbitrum?rankBy=trendingScoreH6&order=desc&minLiq=1000000&min24HVol=5000000", // 1 to 5 ratio volume/liquidity
            DEFAULT = "https://dexscreener.com/arbitrum"
        ]
    }
};

const ABIS = {
    IERC20_METADATA: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)"
    ]
};

module.exports = {
    AMOUNTS,
    ADDRESSES,
    KEYS,
    URLS,
    ABIS
};
