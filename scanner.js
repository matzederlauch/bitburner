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
    const hackScript = 'hack.js';
    const growScript = 'grow.js';
    const weakenScript = 'weaken.js';

    // Calculate the RAM usage of each script
    const hackRam = ns.getScriptRam(hackScript);
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

            // Check if scripts exist on the server, if not, copy them
            if (!ns.fileExists(hackScript, server.name) || !ns.fileExists(growScript, server.name) || !ns.fileExists(weakenScript, server.name)) {
                await ns.scp([hackScript, growScript, weakenScript], server.name);
            }

            const availableRam = server.maxRam - ns.getServerUsedRam(server.name);

            const maxHackThreads = Math.floor(availableRam / hackRam);
            const maxGrowThreads = Math.floor(availableRam / growRam);
            const maxWeakenThreads = Math.floor(availableRam / weakenRam);

            const minSecurityLevel = ns.getServerMinSecurityLevel(server.name);
            const currentSecurityLevel = ns.getServerSecurityLevel(server.name);
            const maxMoney = ns.getServerMaxMoney(server.name);
            const availableMoney = ns.getServerMoneyAvailable(server.name);

            ns.print(`Server: ${server.name}, Root Access: ${ns.hasRootAccess(server.name)}, Hacking Skill: ${ns.getHackingLevel()}, Required Skill: ${server.hackingLevel}`);

            if (availableMoney === 0) {
                const target = servers.find(s => ns.getServerMoneyAvailable(s.name) > 10000);
                if (target) {
                    if (currentSecurityLevel > minSecurityLevel + 5) {
                        if (maxWeakenThreads > 0 && !ns.isRunning(weakenScript, server.name, target.name)) {
                            ns.exec(weakenScript, server.name, maxWeakenThreads, target.name, maxWeakenThreads);
                        }
                    } else if (availableMoney < maxMoney * 0.75) {
                        if (maxGrowThreads > 0 && !ns.isRunning(growScript, server.name, target.name)) {
                            ns.exec(growScript, server.name, maxGrowThreads, target.name, maxGrowThreads);
                        }
                    } else {
                        if (maxHackThreads > 0 && !ns.isRunning(hackScript, server.name, target.name)) {
                            ns.exec(hackScript, server.name, maxHackThreads, target.name, maxHackThreads);
                        }
                    }
                }
            } else {
                if (currentSecurityLevel > minSecurityLevel + 5) {
                    if (maxWeakenThreads > 0 && !ns.isRunning(weakenScript, server.name, server.name)) {
                        ns.exec(weakenScript, server.name, maxWeakenThreads, server.name, maxWeakenThreads);
                    }
                } else if (availableMoney < maxMoney * 0.75) {
                    if (maxGrowThreads > 0 && !ns.isRunning(growScript, server.name, server.name)) {
                        ns.exec(growScript, server.name, maxGrowThreads, server.name, maxGrowThreads);
                    }
                } else {
                    if (maxHackThreads > 0 && !ns.isRunning(hackScript, server.name, server.name)) {
                        ns.exec(hackScript, server.name, maxHackThreads, server.name, maxHackThreads);
                    }
                }
            }
        });

        await Promise.all(promises);
        await ns.sleep(5000); // Wait for 5 seconds before the next iteration
    }
}