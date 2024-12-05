/** @param {NS} ns */
export async function main(ns) {
// Print all owned servers and their stats
    const servers = ns.getPurchasedServers();
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        ns.tprint(`Server ${server} has ${ns.getServerMaxRam(server)} GB of RAM.`);
    }
}