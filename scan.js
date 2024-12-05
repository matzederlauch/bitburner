/** @param {NS} ns */
export async function main(ns) {
    const servers = [];
    const queue = [{ name: 'home', depth: 0, parent: null }];
    const visited = new Set();

    // Scan all servers and store their details
    while (queue.length > 0) {
        const { name, depth, parent } = queue.shift();
        if (!visited.has(name)) {
            visited.add(name);
            if (name !== 'home' && !/^srv\d+$/.test(name)) {
                const hackingLevel = ns.getServerRequiredHackingLevel(name);
                const maxRam = ns.getServerMaxRam(name);
                servers.push({ name, depth, parent, hackingLevel, maxRam });
            }

            const connectedServers = ns.scan(name);
            for (const server of connectedServers) {
                if (!visited.has(server)) {
                    queue.push({ name: server, depth: depth + 1, parent: name });
                }
            }
        }
    }

    // Write server details to a file
    await ns.write('servers.txt', JSON.stringify(servers), 'w');
    ns.tprint('Server details written to servers.txt');
}