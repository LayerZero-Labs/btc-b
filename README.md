#### Note: please fill in your aptos private key in```aptos/.aptos/config.yaml``` under ```profiles:wallet:private_key```


#### Send token from EVM to APTOS
```bash
npx hardhat --network fuji oftSend --target-network aptos-testnet --qty QTY_LOCAL_DECIMALS --local-contract ProxyOFT --remote-contract OFT --aptos-address APTOS_ADDRESS
npx hardhat --network fuji oftSend --target-network aptos-testnet --qty 3 --local-contract ProxyOFT --remote-contract OFT --aptos-address 0x8b107b816356295ea62750020edea701bfc6d11575953d0e146c20d7b9409300
```

#### Send token from APTOS to EVM
```bash
ts-node tasks/aptos/index.ts sendOft --stage testnet --env testnet --to-networks fuji --dst-chain-id DST_CHAIN --qty-ld QTY_LOCAL_DECIMALS --evm-address EVM_ADDRESS
```

#### Claim token on Aptos
```bash
ts-node tasks/aptos/index.ts claimOft --stage testnet --env testnet -a APTOS_ADDRESS
```
