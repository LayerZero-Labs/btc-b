#### Note: please fill in your aptos private key in```aptos/.aptos/config.yaml``` under ```profiles:wallet:private_key```


#### Send token from EVM to APTOS
```bash
npx hardhat --network fuji oftSend --target-network aptos-testnet --qty 1000000000 --local-contract ProxyOFT --remote-contract OFT --aptos-address 0x0d575e51a5d9f2b15391423595bf25b59d5bdd16fc39d3d4175972250300e529
```

#### Send token from APTOS to EVM
```bash
ts-node tasks/aptos/index.ts sendOft --stage testnet --env testnet --to-networks fuji --dst-chain-id 10106 --qty-ld 100000000 --evm-address 0x28921b09dB1C7add63265e5ec79B008F0851D5DC
```

#### Claim token on Aptos
```bash
ts-node tasks/aptos/index.ts claimOft --stage testnet --env testnet -a 0x0d575e51a5d9f2b15391423595bf25b59d5bdd16fc39d3d4175972250300e529
```
