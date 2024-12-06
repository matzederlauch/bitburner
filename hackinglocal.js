import {checkAndCopyScripts, getRootAccess} from 'utils.js';

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

    let maxScripts = Number.isInteger(ns.args[0]) && ns.args[0] > 0 ? ns.args[0] : 10;

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
                if (!ns.hasRootAccess(server.name)) {
                    ns.print(`Skipping ${server.name} because root access could not be obtained`);
                    return;
                }
            }

            await checkAndCopyScripts(ns, server.name, scripts);

            const minSecurityLevel = ns.getServerMinSecurityLevel(server.name);
            const currentSecurityLevel = ns.getServerSecurityLevel(server.name);
            const maxMoney = ns.getServerMaxMoney(server.name);
            const availableMoney = ns.getServerMoneyAvailable(server.name);

            ns.print(`Server: ${server.name}, Root Access: ${ns.hasRootAccess(server.name)}, Hacking Skill: ${ns.getHackingLevel()}, Required Skill: ${server.hackingLevel}`);

            if (availableMoney === 0) {
                ns.print(`Skipping ${server.name} because it has 0 money`);
                return;
            }

            const runningScripts = ns.ps(ns.getHostname()).filter(p => p.args.includes(server.name)).length;
            if (runningScripts >= maxScripts) {
                ns.print(`Skipping ${server.name} because it already has 10 running scripts`);
                return;
            }

            if (currentSecurityLevel > minSecurityLevel + 5) {
                ns.exec(weakenScript, ns.getHostname(), 15, server.name);
            } else if (availableMoney < maxMoney * 0.75) {
                ns.exec(growScript, ns.getHostname(), 15, server.name);
            }
        });

        await Promise.all(promises);
        await ns.sleep(10);
    }
}