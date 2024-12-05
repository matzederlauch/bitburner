import { getRootAccess, checkAndCopyScripts } from 'utils.js';

/** @param {NS} ns */
export async function main(ns) {
    // Check if servers.txt exists, if not, run scan.js
    if (!ns.fileExists('servers.txt')) {
        ns.tprint('servers.txt not found, running scan.js...');
        await ns.run('scan.js');
        await ns.sleep(5000); // Wait for scan.js to complete
    }

    const serverData = await ns.read('servers.txt');
    const servers = JSON.parse(serverData);

    const growScript = 'grow.js';
    const weakenScript = 'weaken.js';
    const scripts = [growScript, weakenScript];

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

            const availableRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname());
            const maxGrowThreads = Math.floor(availableRam / growRam);
            const maxWeakenThreads = Math.floor(availableRam / weakenRam);

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
                ns.exec(weakenScript, ns.getHostname(), maxWeakenThreads, server.name);
            } else if (availableMoney < maxMoney * 0.75) {
                ns.exec(growScript, ns.getHostname(), maxGrowThreads, server.name);
            }
        });

        await Promise.all(promises);
        await ns.sleep(1000);
    }
}