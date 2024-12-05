/** @param {NS} ns */
export async function main(ns) {
    const servers = [];
    const queue = [{name: 'home', depth: 0, parent: null}];
    const visited = new Set();
    const currentServer = ns.getHostname();

    // Scan all servers and store their details
    while (queue.length > 0) {
        const {name, depth, parent} = queue.shift();
        if (!visited.has(name)) {
            visited.add(name);
            if (name !== 'home' && !/^srv\d+$/.test(name)) {
                const hackingLevel = ns.getServerRequiredHackingLevel(name);
                const maxRam = ns.getServerMaxRam(name);
                servers.push({name, depth, parent, hackingLevel, maxRam});
            }

            const connectedServers = ns.scan(name);
            for (const server of connectedServers) {
                if (!visited.has(server)) {
                    queue.push({name: server, depth: depth + 1, parent: name});
                }
            }
        }
    }

    async function getRootAccess(server) {
        const requiredPorts = ns.getServerNumPortsRequired(server);
        let openedPorts = 0;

        if (ns.fileExists('BruteSSH.exe', 'home')) {
            ns.brutessh(server);
            openedPorts++;
        }
        if (ns.fileExists('FTPCrack.exe', 'home')) {
            ns.ftpcrack(server);
            openedPorts++;
        }
        if (ns.fileExists('relaySMTP.exe', 'home')) {
            ns.relaysmtp(server);
            openedPorts++;
        }
        if (ns.fileExists('HTTPWorm.exe', 'home')) {
            ns.httpworm(server);
            openedPorts++;
        }
        if (ns.fileExists('SQLInject.exe', 'home')) {
            ns.sqlinject(server);
            openedPorts++;
        }

        if (openedPorts >= requiredPorts) {
            ns.nuke(server);
        } else {
            ns.print(`Not enough ports opened to nuke ${server}. Required: ${requiredPorts}, Opened: ${openedPorts}`);
        }
    }

    // Define the scripts to run
    const growScript = 'grow.js';
    const weakenScript = 'weaken.js';

    // Calculate the RAM usage of each script
    const growRam = ns.getScriptRam(growScript);
    const weakenRam = ns.getScriptRam(weakenScript);

    while (true) {
        const promises = servers.map(async (server) => {
            // Skip servers that require a higher hacking skill than the current level
            if (ns.getHackingLevel() < server.hackingLevel) {
                ns.print(`Cannot hack ${server.name} because your hacking skill is not high enough`);
                return;
            }

            // Get root access to the server
            if (!ns.hasRootAccess(server.name)) {
                await getRootAccess(server.name);
            }

            const availableRam = ns.getServerMaxRam(currentServer) - ns.getServerUsedRam(currentServer);

            const minSecurityLevel = ns.getServerMinSecurityLevel(server.name);
            const currentSecurityLevel = ns.getServerSecurityLevel(server.name);
            const maxMoney = ns.getServerMaxMoney(server.name);
            const availableMoney = ns.getServerMoneyAvailable(server.name);

            ns.print(`Server: ${server.name}, Root Access: ${ns.hasRootAccess(server.name)}, Hacking Skill: ${ns.getHackingLevel()}, Required Skill: ${server.hackingLevel}`);

            if (availableMoney === 0) {
                ns.print(`Skipping ${server.name} because it has 0 money`);
                return;
            }

            if (currentSecurityLevel > minSecurityLevel + 5) {
                ns.exec(weakenScript, currentServer, 15, server.name);
            } else if (availableMoney < maxMoney * 0.75) {
                ns.exec(growScript, currentServer, 15, server.name);
            }
        });

        await Promise.all(promises);
        await ns.sleep(1000); // Wait for 5 seconds before the next iteration
    }
}