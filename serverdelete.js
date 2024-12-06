// serverdelete.js
/** @param {NS} ns */
export async function main(ns) {
    const serverNumber = ns.args[0];
    if (!serverNumber) {
        ns.tprint("Please provide a server number.");
        return;
    }

    const serverName = `psrv-${serverNumber}`;
    if (ns.serverExists(serverName)) {
        ns.killall(serverName);
        ns.deleteServer(serverName);
        ns.tprint(`All scripts on server ${serverName} killed and server deleted.`);
    } else {
        ns.tprint(`Server ${serverName} does not exist.`);
    }
}