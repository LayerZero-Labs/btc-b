module oft::oft {
    use layerzero::endpoint::UaCapability;
    use layerzero_apps::oft;

    struct OFT {}

    struct Capabilities has key {
        lz_cap: UaCapability<OFT>,
    }

    fun init_module(account: &signer) {
        initialize(account);
    }

    public fun initialize(account: &signer) {
        let lz_cap = oft::init_oft<OFT>(account, b"Bitcoin Avalanche Bridged", b"BTC.b", 8, 8);

        move_to(account, Capabilities {
            lz_cap,
        });
    }

    public entry fun lz_receive(src_chain_id: u64, src_address: vector<u8>, payload: vector<u8>) {
        oft::lz_receive<OFT>(src_chain_id, src_address, payload)
    }
}
