#### Setup
```bash
cd aptos
aptos init

rename default profile to [stage]
stage: mainnet,testnet,sandbox
```

### Config
```bash
- aptos/.aptos/config.yaml
- tasks/aptos/config/[stage].ts
```

#### Compile
```bash
aptos move compile --named-addresses btcb=testnet
```

#### Deploy
```bash
aptos move publish --named-addresses btcb=testnet
```

#### Wire
```bash
ts-node tasks/aptos/index.ts wireAll --stage testnet --env testnet --to-networks goerli,fuji
```