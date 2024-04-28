import { createThirdwebClient, getContract } from "@thirdweb-dev/react";
import { } from "thirdweb/chains";
const client = createThirdwebClient({
    clientId: "1eafd11d31d6d24dfceefb36c3de54d2",
});
// connect to your contract
const contract = getContract({
    client,
    chain: defineChain(534351),
    address: "0x38f43c21e1c263D6cD2A551D10E3D71E87D08B28"
});