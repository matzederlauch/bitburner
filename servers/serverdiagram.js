// servers/serverdiagram.js
/** @param {NS} ns */
export async function main(ns) {
    const serverMap = {};
    const visited = new Set();

    // Read servers from servers.txt
    const serverData = await ns.read('servers.txt');
    const servers = JSON.parse(serverData);

    function scanServer(server) {
        if (visited.has(server)) return;
        visited.add(server);

        const connectedServers = ns.scan(server);
        if (!serverMap[server]) {
            serverMap[server] = {
                connections: [],
                availableRam: ns.getServerMaxRam(server),
                requiredHackingLevel: ns.getServerRequiredHackingLevel(server),
                hasMoney: ns.getServerMoneyAvailable(server) > 0
            };
        }
        for (const connectedServer of connectedServers) {
            serverMap[server].connections.push(connectedServer);
            scanServer(connectedServer);
        }
    }

    // Scan each server from servers.txt
    for (const server of servers) {
        scanServer(server.name);
    }

    await ns.write('serverMap.json', JSON.stringify(serverMap, null, 2), 'w');
    ns.tprint('Server map saved to serverMap.json');
}