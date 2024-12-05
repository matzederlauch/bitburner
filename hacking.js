import { getRootAccess, checkAndCopyScripts } from 'utils.js';

/** @param {NS} ns */
export async function main(ns) {
    const serverData = await ns.read('servers.txt');
    const servers = JSON.parse(serverData);

    const hackScript = 'hack.js';
    const growScript = 'grow.js';
    const weakenScript = 'weaken.js';
    const scripts = [hackScript, growScript, weakenScript];

    const hackRam = ns.getScriptRam(hackScript);
    const growRam = ns.getScriptRam(growScript);
    const weakenRam = ns.getScriptRam(weakenScript);

    while (true) {
        const promises = servers.map(async (server) => {
            if (ns.getHackingLevel() < server.hackingLevel) {
                ns.print(`Cannot hack ${server.name} because your hacking skill is not high enough`);
                return;
            }

            if (!ns.hasRootAccess(server.name)) {
                await getRootAccess(ns, server.name);
            }

            await checkAndCopyScripts(ns, server.name, scripts);

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
        await ns.sleep(5000);
    }
}