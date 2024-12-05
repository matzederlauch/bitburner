import {getRootAccess} from "./utils";

/** @param {NS} ns */
export async function main(ns) {
    const hackScript = 'hack.js';
    const currentServer = ns.getHostname();
    const threadsPerProcess = 15;

    // Check if servers.txt exists, if not, run scan.js
    if (!ns.fileExists('servers.txt')) {
        ns.tprint('servers.txt not found, running scan.js...');
        await ns.run('scan.js');
        await ns.sleep(5000); // Wait for scan.js to complete
    }

    const serverData = await ns.read('servers.txt');
    const servers = JSON.parse(serverData);

    while (true) {
        for (const server of servers) {
            if (server === 'home') continue;

            if (!ns.hasRootAccess(server.name)) {
                ns.print(`Skipping ${server.name} because root access is not available`);
                continue;
            }

            // Calculate available RAM and max threads
            const availableRam = ns.getServerMaxRam(currentServer) - ns.getServerUsedRam(currentServer);
            const hackRam = ns.getScriptRam(hackScript);
            const maxHackThreads = Math.floor(availableRam / hackRam);

            // Check if any script is already running with the target server
            if (!ns.ps(currentServer).some(proc => proc.filename === hackScript && proc.args[0] === server.name)) {
                // Execute hack script locally if there are available threads
                if (maxHackThreads >= threadsPerProcess) {
                    ns.exec(hackScript, currentServer, threadsPerProcess, server.name);
                }
            }
        }
        await ns.sleep(100);
    }
}