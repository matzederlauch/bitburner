/** @param {NS} ns */
export async function getRootAccess(ns, server) {
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

/** @param {NS} ns */
/** @param {NS} ns */
export async function checkAndCopyScripts(ns, server, scripts) {
    const filesToCopy = [...scripts, 'servers.txt'];
    for (const file of filesToCopy) {
        if (!ns.fileExists(file, server)) {
            await ns.scp(file, server);
        }
    }
}