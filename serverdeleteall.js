/** @param {NS} ns */
export async function main(ns) {
    const purchasedServers = ns.getPurchasedServers();
    for (const server of purchasedServers) {
        ns.killall(server);
        ns.deleteServer(server);
        ns.tprint(`All scripts on server ${server} killed and server deleted.`);
    }
}