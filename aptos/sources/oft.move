module btcb::oft {
    use layerzero::endpoint::UaCapability;
    use layerzero_apps::oft;
    use aptos_std::type_info::TypeInfo;
    use std::vector;

    struct BTCbOFT {}

    struct Capabilities has key {
        lz_cap: UaCapability<BTCbOFT>,
    }

    fun init_module(account: &signer) {
        let lz_cap = oft::init_oft<BTCbOFT>(account, b"Bitcoin", b"BTC.b", 8, 8);

        move_to(account, Capabilities {
            lz_cap,
        });
    }

    public entry fun lz_receive(src_chain_id: u64, src_address: vector<u8>, payload: vector<u8>) {
        oft::lz_receive<BTCbOFT>(src_chain_id, src_address, payload)
    }

    public fun lz_receive_types(_src_chain_id: u64, _src_address: vector<u8>, _payload: vector<u8>): vector<TypeInfo> {
        vector::empty<TypeInfo>()
    }
}
