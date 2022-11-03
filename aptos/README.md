#### Setup
```bash
aptos init
```

#### Compile
```bash
aptos move compile --named-addresses oft=testnet
```

#### Deploy
```bash
aptos move publish --named-addresses oft=testnet
```

### Wire
```bash
ts-node index.ts wireAll --stage testnet --env testnet --to-networks goerli
```