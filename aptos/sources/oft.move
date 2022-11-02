module btcb::btcb {
    use layerzero::endpoint::UaCapability;
    use layerzero::oft;

    struct ExampleOFT {}

    struct Capabilities has key {
        lz_cap: UaCapability<ExampleOFT>,
    }

    fun init_module(account: &signer) {
        initialize(account);
    }

    public fun initialize(account: &signer) {
        let lz_cap = oft::init_oft<ExampleOFT>(account, b"Bitcoin Avalanche Bridged", b"BTC.b", 8, 8);

        move_to(account, Capabilities {
            lz_cap,
        });
    }

    public entry fun lz_receive(src_chain_id: u64, src_address: vector<u8>, payload: vector<u8>) {
        oft::lz_receive<ExampleOFT>(src_chain_id, src_address, payload)
    }
}
